const crypto = require('crypto');
// récupère la méthode promisify du module built-in Util de Node
const { promisify } = require('util');
// import librairie json web token
const jwt = require('jsonwebtoken');
// modèle de bdd utilisateur
const User = require('../models/userModel');
// fonction pour remplacer les blocs catch/try
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

// génère le token d'authentification
const signToken = id =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

// fonction asynchrone pour la création d'un nouvel utilisateur
exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        // autorise seulement les données nécessaires pour la création de l'utilisateur pour éviter des failles de sécurité
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
    });

    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'Success',
        token,
        data: {
            user: newUser,
        },
    });
});

// fonction asynchrone pour la connexion d'un utilisateur
exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1) vérifie si il y a un email et un mot de passe
    if (!email || !password) {
        // return et fait suivre l'erreur
        return next(
            new AppError('Veuillez renseigner votre adresse mail et votre mot de passe', 400)
        );
    }

    // 2) vérifie si l'utilisateur existe && si le mot de passe est correct
    const user = await User.findOne({ email }).select('+password');

    // si l'utilisateur n'existe pas OU le mot de passe est incorrect...
    if (!user || !(await user.correctPassword(password, user.password))) {
        // ... return et fait suivre l'erreur
        return next(new AppError('Vos identifiants sont incorrects', 401));
    }

    // 3) Si tout est OK, on envoie la réponse et le token à l'utilisateur
    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token,
    });
});

exports.protect = catchAsync(async (req, res, next) => {
    // 1) récupération du token, vérification qu'il existe
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        // si le token n'existe pas, on return et transmet l'erreur
        return next(
            new AppError(
                `Vous n'êtes pas identifié. Veuillez vous connecter pour obtenir l'accès`,
                401
            )
        );
    }

    // 2) vérification du token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) vérification si l'utilisateur existe encore
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError(`L'utilisateur lié à cet accès n'existe plus`));
    }

    // 4) vérification si l'utilisateur a changé son mdp après que le token ait été fourni
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError(
                `Vous avez changé votre mot de passe récemment, veuillez vous reconnecter`,
                401
            )
        );
    }

    // procure accès à l'tinéraire protégé
    req.user = currentUser;
    next();
});

// création d'une fonction enveloppant le middleware pour lui faire passer des arguments multiples sous la forme d'un spread operator
exports.restrictTo = (...roles) => (req, res, next) => {
    // roles est un tableau. par ex: ['admin', 'lead-guide']
    // si le tableau entré en paramètre pour les permissions ne contient pas le rôle de l'utilisateur, return et transmet l'erreur
    if (!roles.includes(req.user.role)) {
        return next(new AppError(`Vous n'êtes pas autorisé(e) à effectuer cette action.`, 403));
    }

    next();
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Récupérer l'utilisateur sur son mail
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError(`Il n'y a pas d'utilisateur lié à cette adresse mail`, 404));
    }

    // 2) Génération token aléatoire
    const resetToken = user.createPasswordResetToken();
    // met à jour la bdd utilisateur sans les validateurs, pour intégrer le token crypté et sa date d'expiration
    await user.save({ validateBeforeSave: false });

    // 3) envoi à l'utilisateur par mail
    const resetURL = `${req.protocol}://${req.get('host')}/users/resetPassword/${resetToken}`;
    console.log(resetURL);

    const message = `Vous avez oublié votre mot de passe ? Mettez le à jour avec un nouveau mot de passe et confirmation à ${resetURL}\nSi vous n'avez pas changé votre mot de passe, veuillez ignorer cet email`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Réinitialisation de votre mot de passe (valable 10 minutes)',
            message,
        });

        res.status(200).json({
            status: 'success',
            message: 'Le token a été envoyé par email !',
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new AppError(`L'envoi d'email a rencontré une erreur, veuillez ré-essayer plus tard`),
            500
        );
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) récupération de l'utilisateur grâce au token
    // enccryptage du token envoyé par l'utilisateur en paramètre
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    // récupère l'utilisateur avec le token crypté pour qu'il corresponde à celui de la bdd, et vérifie si il n'est pas expiré
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    // 2) Si le token n'est pas expiré et que l'utilisateur existe, définit le nouveau mdp et supprime le token
    if (!user) {
        return next(new AppError(`Le token est invalide ou expiré`, 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) met à jour la propriété changedPasswordAt sur l'utilisateur sous forme de hook pre-save dans le userModel

    // 4) connecte l'utilisateur et lui envoie un json web token
    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token,
    });
});
