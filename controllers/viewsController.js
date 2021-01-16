const Project = require('../models/projectModel');
const Bill = require('../models/billModel');
const catchAsync = require('../utils/catchAsync');

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

    res.status(200).render('project', {
        title: 'coucou',
        project,
    });
});

exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: 'Connexion',
    });
};
