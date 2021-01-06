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
    console.log(bill.userId, req.user._id);

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
    const newBill = await Bill.create({
        name: req.body.name,
        price: req.body.price,
        endorsement: req.body.endorsement,
        date: Date.now(),
        projectId: req.params.id,
        userId: req.user._id,
    });

    // const project = await Project.findOne({ _id: req.params.id });
    // project.bills.push()
    // newBill.number = await Bill.find()

    res.status(201).json({
        status: 'success',
        data: {
            bill: newBill,
        },
    });
    console.log('Nouvelle facture créée');
});
