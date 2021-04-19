// Création d'une classe de gestion d'erreurs à laquelle on étend la classe pré-construite Error
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);

        this.statusCode = statusCode;
        // statusCode = 4xx = fail // 500 = erreur serveur
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        // Distinction des erreurs opérationnelles des erreurs de code
        this.isOperational = true;

        // capture de la stack trace pour éviter que l'appel de fonction du constructor pollue le stack
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
