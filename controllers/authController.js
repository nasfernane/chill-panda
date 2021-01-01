// récupère la méthode promisify du module built-in Util de Node
const { promisify } = require('util');
// import librairie json web token
const jwt = require('jsonwebtoken');
// modèle de bdd utilisateur
const User = require('../models/userModel');
// fonction pour remplacer les blocs catch/try
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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
