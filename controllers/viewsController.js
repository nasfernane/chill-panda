const Project = require('../models/projectModel');
const User = require('../models/userModel');
const Bill = require('../models/billModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// overview de tous les projets
exports.getOverview = catchAsync(async (req, res, next) => {
    // récupération de tous les projets de la collection
    console.log(req.user);
    const projects = await Project.find({ user: req.user._id });

    res.status(200).render('overview', {
        title: 'All Projects',
        projects,
    });
});

// page projet individuel
exports.getProject = catchAsync(async (req, res, next) => {
    // récupère le projet sur son id et populate ses factures
    const project = await Project.findOne({ _id: req.params.id, user: req.user._id }).populate({
        path: 'bills',
    });

    // renvoie une erreur personnalisée si le projet n'est pas trouvé
    if (!project) {
        return next(
            new AppError(
                `Chill panda est trop fatigué pour aller chercher des projets qui n'existent pas.`,
                404
            )
        );
    }

    res.status(200).render('project', {
        title: 'Projet',
        project,
    });
});

exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: 'Connexion',
    });
};

exports.getSignupForm = (req, res) => {
    res.status(200).render('signup', {
        title: 'Inscription',
    });
};

// page informations personnelles
exports.getAccount = catchAsync(async (req, res, next) => {
    // l'utilisateur est déjà récupéré par le middleware protect, on render donc juste la page

    res.status(200).render('account', {
        title: 'Mon Compte'
    });
});
