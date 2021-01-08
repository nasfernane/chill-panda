// import des modèles
const Bill = require('../models/billModel');
const Project = require('../models/projectModel');
// import des méthodes API
const APIFeatures = require('../utils/apiFeatures');
// import module pour remplacer les blocs try/catch
const catchAsync = require('../utils/catchAsync');
// constructeur d'erreur
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// vérifie que le projet concerné par la facture appartient à l'utilisateur et ajoute des infos au body
exports.checkBeforeCreateBill = catchAsync(async (req, res, next) => {
    // vérifie que le projet dans lequel l'utillisateur essaie d'ajouter une facture lui appartient
    const project = await Project.findById(req.params.projectid);
    console.log(req.params);
    if (!project.user._id.equals(req.user._id)) {
        return next(
            new AppError(`Vous n'avez pas la permission de créer une facture dans ce projet`)
        );
    }

    // Si on ne précise pas le Projet, on le récupère dans la requête
    if (!req.body.project) req.body.project = req.params.projectid;

    // détermine le numéro de facture en fonction du nombre de documents lié à l'utilisateur
    req.body.billNumber = (await Bill.countDocuments({ user: req.user._id })) + 1;

    next();
});

// crée une nouvelle facture depuis le projet concerné
exports.createBill = factory.createOne(Bill);
// supprime une facture
exports.deleteBill = factory.deleteOne(Bill);
// met à jour une facture
exports.updateBill = factory.updateOne(Bill);
// récupère une facture avec son ID
exports.getBill = factory.getOne(Bill, 'project', 'user');
// récupère toutes les factures de l'utilisateur
exports.getAllBills = factory.getAll(Bill);
