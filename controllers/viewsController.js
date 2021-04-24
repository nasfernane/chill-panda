const Project = require('../models/projectModel');
const Bill = require('../models/billModel');
const Stat = require('../models/statModel');
const Yearstat = require('../models/yearStatModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
// regroupe les méthodes de tri, filtres et pagination
const APIFeatures = require('../utils/apiFeatures');

// overview de tous les projets
exports.getOverview = catchAsync(async (req, res, next) => {
    // filtre pour ne récupérer que les documents de l'utilisateur
    let filter = { user: `${req.user._id}` };
    // crée une instance d'APIFeatures sur une requête, sur laquelle on choisit quelle fonctions on souhaite appliquer
    const docs = new APIFeatures(Project.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    // on récupère les données de la requête transformée
    const projects = await docs.query;

    // on projette la vue avec les données récupérées
    res.status(200).render('overview', {
        title: 'All Projects',
        projects,
    });
});

// fonction pour récupérer l'ensemble des factures. Même structure que l'overview des projets
exports.getBillsOverview = catchAsync(async (req, res, next) => {
    let filter = { user: `${req.user._id}` };

    const docs = new APIFeatures(Bill.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const bills = await docs.query;

    res.status(200).render('bills', {
        title: 'Vos factures',
        bills,
    });
});

// page projet individuel
exports.getProject = catchAsync(async (req, res, next) => {
    // récupère le projet sur son id et populate ses factures
    const project = await Project.findOne({ _id: req.params.id, user: req.user._id }).populate({
        path: 'bills',
    });

    // récupère le numéro du dernier devis pour pré-remplir le champ du nouveau projet
    const lastBill = await Bill.aggregate([
        {
            $match: { user: req.user._id },
        },
        {
            $sort: {
                billNumber: -1,
            },
        },
        {
            $limit: 1,
        },
    ]);

    const [lastBillNumber] = lastBill;
    const defaultBillNumber = lastBillNumber.billNumber + 1;

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
        defaultBillNumber,
    });
});

// affiche le formulaire d'édition de projet
exports.editProject = catchAsync(async (req, res, next) => {
    // récupère le projet sur son id
    const project = await Project.findOne({ _id: req.params.id, user: req.user._id });

    // renvoie une erreur personnalisée si le projet n'est pas trouvé
    if (!project) {
        return next(
            new AppError(
                `Chill Panda est trop fatigué pour aller chercher des projets qui n'existent pas.`,
                404
            )
        );
    }

    res.status(200).render('editproject', {
        title: 'Update Project',
        project,
    });
});

// WATCH crée les stats par mois pour la page de facturations
exports.createStats = catchAsync(async (req, res, next) => {
    await Stat.deleteMany();

    // crée données mensuelles des projets créés
    await Project.aggregate([
        {
            // phase 1 : récupère tous les projets sauf ceux qui sont avortés ou en proposition
            $match: {
                $and: [
                    // et qui appartiennent à l'utilisateur
                    { user: req.user._id },
                    {
                        $or: [
                            // et dont le statut est l'un des suivants
                            { status: 'Terminé' },
                            { status: 'En pause' },
                            { status: 'A régler' },
                            { status: 'En cours' },
                        ],
                    },
                ],
            },
        },
        {
            // groupe par année et par mois
            $group: {
                _id: { year: { $year: '$date' }, month: { $month: '$date' } },
                projectsSum: { $sum: '$quote' },
                user: { $first: '$user' },
            },
        },
        {
            $merge: {
                into: 'stats',
                on: '_id',
                whenMatched: 'merge',
                whenNotMatched: 'insert',
            },
        },
    ]);

    // crée données mensuelles des factures crées
    await Bill.aggregate([
        {
            $match: { user: req.user._id },
        },
        {
            $group: {
                _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                billsSum: { $sum: '$price' },
                user: { $first: '$user' },
            },
        },
        {
            $merge: {
                into: 'stats',
                on: '_id',
                whenMatched: 'merge',
                whenNotMatched: 'insert',
            },
        },
    ]);

    // crée données mensuelles des factures réglées
    await Bill.aggregate([
        {
            // phase 1 : récupère tous les projets sauf ceux qui sont avortés ou en proposition
            $match: {
                $and: [{ user: req.user._id }, { state: 'Effectué' }],
            },
        },
        {
            $group: {
                _id: { year: { $year: '$paidAt' }, month: { $month: '$paidAt' } },
                paidBillsSum: { $sum: '$price' },
                user: { $first: '$user' },
            },
        },
        {
            $merge: {
                into: 'stats',
                on: '_id',
                whenMatched: 'merge',
                whenNotMatched: 'insert',
            },
        },
    ]);

    next();
});

// WATCH récupère les stats par mois pour la page de facturations
exports.getStats = catchAsync(async (req, res, next) => {
    // récupère toutes les stats mensuelles...
    const monthlyStats = await Stat.aggregate([
        {
            $match: { user: req.user._id },
        },
    ]);

    // ...puis annuelles
    const yearStats = await Stat.aggregate([
        {
            $match: { user: req.user._id },
        },
        {
            $group: {
                _id: { year: '$_id.year' },
                projectTotal: { $sum: '$projectsSum' },
                billTotal: { $sum: '$billsSum' },
                paidBillTotal: { $sum: '$paidBillsSum' },
            },
        },
        {
            $sort: {
                '_id.year': -1,
            },
        },
    ]);

    // et render la page
    res.status(200).render('stats', {
        title: 'Statistiques',
        monthlyStats,
        yearStats,
    });
});

// affiche le formulaire de création d'un nouveau projet
exports.newProject = catchAsync(async (req, res, next) => {
    // récupère le numéro du dernier devis pour pré-remplir le champ du nouveau projet
    const lastProjectNumber = await Project.aggregate([
        {
            $match: { user: req.user._id },
        },
        {
            $sort: {
                quoteNumber: -1,
            },
        },
        {
            $limit: 1,
        },
    ]);

    res.status(200).render('newproject', {
        title: 'Nouveau projet',
        lastProjectNumber,
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
        title: 'Mon Compte',
    });
});
