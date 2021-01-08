// Regroupe les fonctions générales pour factoriser le code, pour créer, mettre à jour, supprimer ou lire un document
//

// remplace les blocs try/catch
const catchAsync = require('../utils/catchAsync');
// constructeur d'erreurs
const AppError = require('../utils/appError');

// suppression d'un document
exports.deleteOne = Model =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);

        if (!doc) {
            return next(new AppError('Document introuvable'));
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

        if (!doc) {
            return next(new AppError('Document introuvable'));
        }

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

        res.status(201).json({
            status: 'success',
            data: {
                data: doc,
            },
        });
    });
