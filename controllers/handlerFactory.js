const catchAsync = require('../utils/catchAsync');
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
