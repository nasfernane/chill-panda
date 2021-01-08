const AppError = require('../utils/appError');

// gestion d'erreur mongoose : cast errors (objectId)
const handleCastErrorDB = err => {
    console.log(err);
    const message = `${err.path} invalide : ${err.value}`;
    return new AppError(message, 400);
};

// gestion d'erreur mongoose : duplicate field
const handleDuplicateFieldDB = err => {
    const message = `Ces données existent déjà: ${err.keyValue.name}`;
    return new AppError(message, 400);
};

// gestion d'erreur mongoose : validation errors
const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);

    const message = `Données invalides. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

// gestion d'erreur des json web tokens
const handleJWTError = err =>
    new AppError('Accès invalide, veuillez vous identifier à nouveau', 401);

// gestion d'erreur token jtw expiré
const handleJWTExpiredError = () =>
    new AppError('Votre accès a expiré. Veuillez vous reconnecter', 401);

// gestion des erreurs en mode développement
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

// gestion des erreurs en mode production
const sendErrorProd = (err, res) => {
    // séparation des erreurs opérationnelles "côté client"...
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
        // ... des erreurs de code ou inconnues
    } else {
        console.error('Erreur rencontrée 💥', err);
        res.status(500).json({
            status: 'error',
            message: 'Le programme a rencontré une erreur !',
        });
    }
};

module.exports = (err, req, res, next) => {
    // définit le statusCode de l'erreur sur elle même si elle est définie || 500 (internal server error)
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        // hard copy l'erreur pour ne pas ré-assigner la valeur du middleware
        let error = { ...err };
        console.log(error);
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

        sendErrorProd(error, res);
    }
};
