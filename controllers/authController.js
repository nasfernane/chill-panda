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

// creation du token et envoi du cookie
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        // expire dans maintenant + date d'expiration (trois mois)
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };

    // option secure seulement en mode production
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    // envoi du cookie
    res.cookie('jwt', token, cookieOptions);

    // enlève le mdp de la réponse à l'utilisateur
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};

// fonction asynchrone pour la création d'un nouvel utilisateur
exports.signup = catchAsync(async (req, res, next) => {
    // alerte d'erreur si les mots de passe ne correspondent pas
    if (req.body.password !== req.body.passwordConfirm) {
        return next(new AppError('Vos mots de passe ne correspondent pas', 400));
    }

    // alerte d'erreur si l'adresse mail est déjà utilisée
    const [existingUser] = await User.find({ email: req.body.email });
    console.log(existingUser);
    // si on trouve un résultat, refuse la création
    if (typeof existingUser !== 'undefined') {
        return next(new AppError('Cette adresse email est déjà utilisée', 400));
    }

    // création de l'utilisateur
    const newUser = await User.create({
        // autorise seulement les données nécessaires pour la création de l'utilisateur pour éviter des failles de sécurité
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });

    createSendToken(newUser, 201, res);
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
    createSendToken(user, 200, res);
});

// pour log out l'utilisateur, renvoie un nouveau token vide pour override le cookie
exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 1 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
    // 1) récupération du token, vérification qu'il existe
    let token;
    // récupère le token des headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        // accepte également le token via cookies
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        // si le token n'existe pas, on return et transmet l'erreur

        return next(
            new AppError(
                `Vous n'êtes pas identifié. Veuillez vous connecter pour obtenir l'accès. Redirection dans trois secondes...`,
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
    res.locals.user = currentUser;
    next();
});

// création d'une fonction enveloppant le middleware pour lui faire passer des arguments multiples sous la forme d'un spread operator
exports.restrictTo = (...roles) => (req, res, next) => {
    // roles est un tableau. par ex: ['admin', 'lead-guide']
    // si le tableau entré en paramètre pour les permissions ne contient pas le rôle de l'utilisateur...
    if (!roles.includes(req.user.role)) {
        // return et transmet l'erreur 403 (forbidden)
        return next(new AppError(`Vous n'êtes pas autorisé(e) à effectuer cette action.`, 403));
    }

    next();
};

// middleware pour supprimer le mot de passe et envoyer un token aléatoire par mail
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
    const resetURL = `${req.protocol}://${req.get('host')}/users/resetpassword/${resetToken}`;

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
    createSendToken(user, 200, res);
});

// modification du mot de passe en direct
exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) récupérer l'utilisateur
    const user = await User.findById(req.user.id).select('+password');

    if (req.body.password !== req.body.passwordConfirm) {
        return next(new AppError(`Vos mots de passe ne correspondent pas`), 401);
    }
    // 2) Si le mdp est incorrect...
    if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
        // ... return et faire suivre erreur (unauthorised)
        return next(new AppError(`Vos identifiants sont incorrects`), 401);
    }
    // 3) mise à jour du mdp
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // 4) connecter l'utilisateur, envoyer le json web token
    createSendToken(user, 200, res);
});
