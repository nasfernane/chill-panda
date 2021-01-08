const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// fonction pour filtrer les champs autorisés quand un utilisateur met ses données à jour
const filterObj = (obj, ...allowedFields) => {
    // objet vide qui accueillera les champs validés
    const newObj = {};
    // boucle sur les clés de l'objet entré en paramètre
    Object.keys(obj).forEach(el => {
        // si le tableau allowdFields contient une des clés de l'objet sur lequel on boucle, on l'ajoute au nouvel objet
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

// middleware pour que l'utilisateur récupère ses données. Fait suivre sur un getUser classique mais en récupérant l'id du middleware protect
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

// maj données d'un utilisateur par lui-même
exports.updateUserData = catchAsync(async (req, res, next) => {
    // 1) Création d'erreur si l'utilisateur essaie de modifier son mdp
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError(`Vous ne pouvez pas modifier votre mot de passe ici`, 400));
    }

    // 2) filtre par champs autorisés
    const filteredBody = filterObj(req.body, 'name', 'email');

    // 3) Mise à jour des données utilisateur
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser,
        },
        message: 'Vos données ont été mises à jour correctement',
    });
});

// désactiver un utilisateur
exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: `Cette route n'est pas définie, utilisez plutot /signup`,
    });
};

// GET tous les utilisateurs
exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();

    // ENVOI DE LA REPONSE
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users,
        },
    });
});

// mise à jour d'un utilisateur (version admin)
exports.updateUser = factory.updateOne(User);
// suppression d'un utilisateur (version admin)
exports.deleteUser = factory.deleteOne(User);
// récupère un utilisateur sur son ID
exports.getUser = factory.getOne(User);
