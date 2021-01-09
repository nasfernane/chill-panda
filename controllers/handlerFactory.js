// Regroupe les fonctions générales pour factoriser le code, pour créer, mettre à jour, supprimer ou lire un document
//

// remplace les blocs try/catch
const catchAsync = require('../utils/catchAsync');
// constructeur d'erreurs
const AppError = require('../utils/appError');
// regroupe les méthodes de tri, filtres et pagination
const APIFeatures = require('../utils/apiFeatures');

// suppression d'un document
exports.deleteOne = Model =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);

        if (!doc) {
            return next(new AppError('Document introuvable'));
        }

        // vérifie si il y a un rôle pour que cette vérification ne soit pas effective lors de la suppression d'un utilisateur
        // si c'est pour récupérer un projet ou une facture, vérifie qu'ils appartiennent à l'utilisateur connecté
        if (!doc.role && !doc.user._id.equals(req.user._id)) {
            return next(new AppError(`Vous n'avez pas la permission de supprimer à ce document`));
        }

        // 204 = no content
        res.status(204).json({
            status: 'success',
            // on ne renvoie rien si les données sont correctement supprimées
            data: null,
        });
    });

// mise à jour d'un document
exports.updateOne = Model =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            // renvoie le nouvel objet
            new: true,
            // parcours à nouveau les validateurs
            runValidators: true,
        });

        console.log(doc.user._id, req.user);

        if (!doc) {
            return next(new AppError('Document introuvable'));
        }

        // vérifie si il y a un rôle pour que cette vérification ne soit pas effective lors de la modification  d'un utilisateur
        // si c'est pour modifier un projet ou une facture, vérifie qu'ils appartiennent à l'utilisateur connecté
        if (!doc.role && !doc.user._id.equals(req.user._id)) {
            return next(new AppError(`Vous n'avez pas la permission d'accéder à ce document`));
        }

        // 200 = OK
        res.status(200).json({
            status: 'success',
            data: {
                data: doc,
            },
        });
    });

// création d'un document
exports.createOne = Model =>
    catchAsync(async (req, res, next) => {
        // Si on ne précise pas l'user, on le récupère depuis le middleware protect()
        if (!req.body.user) req.body.user = req.user.id;

        const doc = await Model.create(req.body);

        // 201 = created
        res.status(201).json({
            status: 'success',
            data: {
                data: doc,
            },
        });
    });

// récupérer un document avec options populate()
exports.getOne = (Model, popOne, popTwo) =>
    catchAsync(async (req, res, next) => {
        let query = Model.findById(req.params.id);
        if (popOne) query = query.populate(popOne);
        if (popTwo) query = query.populate(popOne).populate(popTwo);

        const doc = await query;

        // vérifie que le document existe
        if (!doc) {
            return next(new AppError('Document introuvable'));
        }

        // vérifie si il y a un rôle pour que cette vérification ne soit pas effective lors de la récupération un utilisateur
        // si c'est pour récupérer un projet ou une facture, vérifie qu'ils appartiennent à l'utilisateur connecté
        if (!doc.role && !doc.user._id.equals(req.user._id)) {
            return next(new AppError(`Vous n'avez pas la permission d'accéder à ce document`));
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: doc,
            },
        });
    });

// récupérer tous les documents
exports.getAll = Model =>
    catchAsync(async (req, res) => {
        // filtre pour ne récupérer que les documents de l'utilisateur
        let filter = { user: `${req.user._id}` };
        // si l'url possède un paramètre projectid, le rajoute dans le filtre pour récupérer seulement les factures du projet concerné
        if (req.params.projectid)
            filter = { user: `${req.user._id}`, project: req.params.projectid };

        // crée une instance d'APIFeatures pour récupérer les méthodes sur API, on choisit quelle fonctions appliquer à cette méthode
        const features = new APIFeatures(Model.find(filter), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        // on récupère la requête transformée
        const doc = await features.query.explain();

        // ENVOI DE LA REPONSE
        res.status(200).json({
            status: 'success',
            results: doc.length,
            data: {
                data: doc,
            },
        });
    });
