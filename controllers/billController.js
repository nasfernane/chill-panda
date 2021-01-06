// import du modèle Project
const Bill = require('../models/billModel');
const Project = require('../models/projectModel');
// import des méthodes API
const APIFeatures = require('../utils/apiFeatures');
// import module pour remplacer les blocs try/catch
const catchAsync = require('../utils/catchAsync');
// constructeur d'erreur
const AppError = require('../utils/appError');

// récupère tous les projets de la BDD correspondant à l'id de l'utilisateur connecté, avec options de tri, filtre et pagination
exports.getAllBills = catchAsync(async (req, res) => {
    const features = new APIFeatures(Bill.find({ userId: `${req.user._id}` }), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    // récupération de la requête transformée
    const bills = await features.query;

    // envoi de la réponse
    res.status(200).json({
        status: 'success',
        results: bills.length,
        data: {
            bills,
        },
    });
});

// récupère une facture avec son ID
exports.getBill = catchAsync(async (req, res, next) => {
    const bill = await Bill.findById(req.params.id).select('-__v');

    // vérifie que lo facture existe
    if (!bill) {
        return next(new AppError('La facture est introuvable'));
    }

    // vérifie que la facture appartient à l'utilisateur
    if (!bill.userId.equals(req.user._id)) {
        return next(new AppError(`Vous n'avez pas la permission d'accéder à cette facture`));
    }

    res.status(200).json({
        status: 'success',
        data: {
            bill,
        },
    });
});

// crée une nouvelle facture depuis le projet concerné
exports.createBill = catchAsync(async (req, res, next) => {
    const project = await Project.findById(req.params.id);

    // vérifie que le projet dans lequel l'utillisateur essaie d'ajouter une facture lui appartient
    if (!project.userId.equals(req.user._id)) {
        return next(
            new AppError(`Vous n'avez pas la permission de créer une facture dans ce projet`)
        );
    }

    const newBill = await Bill.create({
        name: req.body.name,
        price: req.body.price,
        endorsement: req.body.endorsement,
        date: Date.now(),
        projectId: req.params.id,
        userId: req.user._id,
        // détermine le numéro de facture en fonction du nombre de documents lié à l'utilisateur
        billNumber: (await Bill.countDocuments({ userId: req.user._id })) + 1,
    });

    res.status(201).json({
        status: 'success',
        data: {
            bill: newBill,
        },
    });
    console.log('Nouvelle facture créée');
});

// supprime une facture
exports.deleteBill = catchAsync(async (req, res, next) => {
    const bill = await Bill.findByIdAndDelete(req.params.id);

    if (!bill) {
        return next(new AppError(`La facture est introuvable n°${req.params.id}`));
    }

    // vérifie que la facture appartient à l'utilisateur
    if (!bill.userId.equals(req.user._id)) {
        return next(new AppError(`Vous n'avez pas la permission de modifier cette facture`));
    }

    // supprime la référence de la facture dans le projet concerné
    const project = await Project.findById(bill.projectId);
    const billIndex = project.bills.indexOf(`${req.params.id}`);
    project.bills.splice(billIndex, 1);
    project.save();

    res.status(204).json({
        status: 'success',
        // on ne renvoie rien si les données sont correctement supprimées
        data: null,
    });
});
