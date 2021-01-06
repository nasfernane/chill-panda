// import du modèle Project
const Bill = require('../models/billModel');
// import des méthodes API
const APIFeatures = require('../utils/apiFeatures');
// import module pour remplacer les blocs try/catch
const catchAsync = require('../utils/catchAsync');
// constructeur d'erreur
const AppError = require('../utils/appError');

// récupère tous les projets de la BDD
exports.getAllBills = catchAsync(async (req, res) => {
    const features = new APIFeatures(Bill.find(), req.query)
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
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
        return next(new AppError('La facture est introuvable'));
    }

    res.status(200).json({
        status: 'success',
        data: {
            bill,
        },
    });
});

// crée une nouvelle facture depuis le projet concerné
exports.createBill = catchAsync(async (req, res) => {
    const newBill = await Bill.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            bill: newBill,
        },
    });
    console.log('Nouveau projet créé');
});
