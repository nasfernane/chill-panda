// import des modèles
const Project = require('../models/projectModel');
const Bill = require('../models/billModel');
// import des méthodes API
const APIFeatures = require('../utils/apiFeatures');
// import module pour remplacer les blocs try/catch
const catchAsync = require('../utils/catchAsync');
// constructeur d'erreur
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// récupère tous les projets de la BDD
exports.getAllProjects = catchAsync(async (req, res) => {
    const features = new APIFeatures(Project.find({ user: `${req.user._id}` }), req.query)
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
    const project = await Project.findById(req.params.id).populate('bills');

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
    const newProject = await Project.create({
        client: req.body.client,
        name: req.body.name,
        quote: req.body.quote,
        status: req.body.status,
        projectType: req.body.projectType,
        user: req.user._id,
    });

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
exports.deleteProject = factory.deleteOne(Project);
