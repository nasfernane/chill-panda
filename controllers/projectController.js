// import des modèles
const Project = require('../models/projectModel');
const Bill = require('../models/billModel');
// import des méthodes API
// const APIFeatures = require('../utils/apiFeatures');
// import module pour remplacer les blocs try/catch
const catchAsync = require('../utils/catchAsync');
// constructeur d'erreur
// const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// définit le numéro de devis en fonction du nombre de projets existants
exports.setQuoteNumber = catchAsync(async (req, res, next) => {
    // détermine le numéro de facture en fonction du nombre de documents lié à l'utilisateur
    req.body.quoteNumber = (await Project.countDocuments({ user: req.user._id })) + 1;

    next();
});

// met à jour un projet
exports.updateProject = factory.updateOne(Project);
// supprime un projet
exports.deleteProject = factory.deleteOne(Project);
// crée un nouveau projet
exports.createProject = factory.createOne(Project);
// récupère un projet avec son ID et populate les factures
exports.getProject = factory.getOne(Project, 'bills');
// récupère tous les projets de l'utilisateur
exports.getAllProjects = factory.getAll(Project);
