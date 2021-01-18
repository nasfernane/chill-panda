const AppError = require('../utils/appError');

// gestion d'erreur mongoose : cast errors (objectId)
const handleCastErrorDB = err => {
    const message = `${err.path} invalide : ${err.value}`;
    return new AppError(message, 400);
};

// gestion d'erreur mongoose : duplicate field
const handleDuplicateFieldDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    console.log(value);

    const message = `Ces données existent déjà: ${value} `;
    return new AppError(message, 400);

};

// gestion d'erreur mongoose : validation errors
const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);

    const message = `Données invalides. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

// gestion d'erreur des json web tokens
const handleJWTError = () =>
    new AppError('Accès invalide, veuillez vous identifier à nouveau', 401);

// gestion d'erreur token jtw expiré
const handleJWTExpiredError = () =>
    new AppError('Votre accès a expiré. Veuillez vous reconnecter', 401);

// gestion des erreurs en mode développement
const sendErrorDev = (err, req, res) => {
    // A) erreurs sur API
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        });
    }

    // B) erreur sur rendu du site réel
    console.error('ERROR 💥', err)
    return res.status(err.statusCode).render('error', {
        title: 'Erreur',
        msg: err.message,
    });
};

// gestion des erreurs en mode production
const sendErrorProd = (err, req, res) => {
    // A) API
    if (req.originalUrl.startsWith('/api')) {
    // séparation des erreurs opérationnelles "côté client"...
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        }

        // ... des erreurs de code ou inconnues
        console.error('Erreur rencontrée 💥', err);
        return res.status(500).json({
            status: 'error',
            message: 'Le programme a rencontré une erreur !',
        });
    }

    // B) rendu site réel
    // séparation des erreurs opérationnelles "côté client"...
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Erreur',
            msg: err.message,
    });
    } 

    // ... des erreurs de code ou inconnues
    console.error('Erreur rencontrée 💥', err);
    return res.status(err.statusCode).render('error', {
        title: 'Erreur',
        msg: err.message,
    });
}

module.exports = (err, req, res, next) => {
    // définit le statusCode de l'erreur sur elle même si elle est définie || 500 (internal server error)
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        // hard copy l'erreur pour ne pas ré-assigner la valeur du middleware
        let error = { ...err };
        error.message = err.message
        // délègue les erreurs mongoose dans des fonctions séparées pour les transformer en erreurs opérationnelles et renvoyer une erreur 'human friendly'
        // si c'est une erreur de champ
        if (error.kind === 'ObjectId') error = handleCastErrorDB(error);
        // si c'est un doublon
        if (error.code === 11000) error = handleDuplicateFieldDB(error);
        // si c'est un problème de validateurs
        if (error._message === 'Project validation failed') error = handleValidationErrorDB(error);
        // si c'est une erreur de json web token
        if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, req, res);
    }
};
