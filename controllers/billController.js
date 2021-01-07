// import du modèle Project
const Bill = require('../models/billModel');
const Project = require('../models/projectModel');
// import des méthodes API
const APIFeatures = require('../utils/apiFeatures');
// import module pour remplacer les blocs try/catch
const catchAsync = require('../utils/catchAsync');
// constructeur d'erreur
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// récupère toutes les factures de la BDD correspondant à l'id de l'utilisateur connecté, avec options de tri, filtre et pagination
exports.getAllBills = catchAsync(async (req, res) => {
    // filtre pour ne récupérer que les factures de l'utilisateur
    let filter = { user: `${req.user._id}` };
    // si l'url possède un paramètre projectid, le rajoute dans le filtre pour récupérer seulement les factures du projet concerné
    if (req.params.projectid) filter = { user: `${req.user._id}`, project: req.params.projectid };

    // options de filtres/tris
    const features = new APIFeatures(Bill.find(filter), req.query)
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
    const bill = await Bill.findById(req.params.id)
        .select('-__v')
        .populate('project')
        .populate('user');

    // vérifie que lo facture existe
    if (!bill) {
        return next(new AppError('La facture est introuvable'));
    }

    // vérifie que la facture appartient à l'utilisateur
    if (!bill.user.equals(req.user._id)) {
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
    // vérifie que le projet dans lequel l'utillisateur essaie d'ajouter une facture lui appartient
    const project = await Project.findById(req.params.projectid);
    if (!project.user._id.equals(req.user._id)) {
        return next(
            new AppError(`Vous n'avez pas la permission de créer une facture dans ce projet`)
        );
    }

    const newBill = await Bill.create({
        name: req.body.name,
        price: req.body.price,
        endorsement: req.body.endorsement,
        project: req.params.projectid,
        user: req.user._id,
        // détermine le numéro de facture en fonction du nombre de documents lié à l'utilisateur
        billNumber: (await Bill.countDocuments({ user: req.user._id })) + 1,
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
exports.deleteBill = factory.deleteOne(Bill);
