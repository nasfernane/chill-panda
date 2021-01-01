// import du modèle Project
const Project = require('../models/projectModel');
// import des méthodes API
const APIFeatures = require('../utils/apiFeatures');
// import module pour remplacer les blocs try/catch
const catchAsync = require('../utils/catchAsync');
// constructeur d'erreur
const AppError = require('../utils/appError');

// récupère tous les projets de la BDD
exports.getAllProjects = catchAsync(async (req, res) => {
    const features = new APIFeatures(Project.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    // récupération de la requête transformée
    const projects = await features.query;

    // envoi de la réponse
    res.status(200).json({
        status: 'success',
        results: projects.length,
        data: {
            projects,
        },
    });
});

// récupère un projet avec son ID
exports.getProject = catchAsync(async (req, res, next) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        return next(new AppError('Le projet est introuvable'));
    }

    res.status(200).json({
        status: 'success',
        data: {
            project,
        },
    });
});

// crée un nouveau projet
exports.createProject = catchAsync(async (req, res) => {
    const newProject = await Project.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            project: newProject,
        },
    });
    console.log('Nouveau projet créé');
});

// update un projet
exports.updateProject = catchAsync(async (req, res, next) => {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
        // renvoie le nouvel objet
        new: true,
        // charge à nouveau les validateurs du schéma originel pour valider le nouvel objet
        runValidators: true,
    });

    if (!project) {
        return next(new AppError('Le projet est introuvable'));
    }

    res.status(200).json({
        status: 'success',
        data: {
            project,
        },
    });
});

// supprime un projet
exports.deleteProject = catchAsync(async (req, res, next) => {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
        return next(new AppError('Le projet est introuvable'));
    }

    res.status(204).json({
        status: 'success',
        // on ne renvoie rien si les données sont correctement supprimées
        data: null,
    });
});
