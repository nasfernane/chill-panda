// modules - Middlewares
const express = require('express');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

//routeurs
const projectRouter = require('./routes/projectRoutes');
const userRouter = require('./routes/userRoutes');
const billRouter = require('./routes/billRoutes');

// création de l'app express
const app = express();

// MIDDLEWARES GLOBAUX

// Utilisation du middleware helmet pour définir les headers http
app.use(helmet());

// Logs des requêtes en mode développement
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// limite le nombre de requêtes pour pallier aux "brute force attacks"
const limiter = rateLimit({
    // max 100...
    max: 100,
    // ... sur une fenêtre d'une heure
    windowMs: 60 * 60 * 1000,
    message: `Vous avez envoyé trop de requêtes, veuillez ré-essayer dans une heure`,
});
app.use(limiter);

// Parser pour lire les données du body dans les requêtes. Limite le nombre de données pour améliorer la sécurité
app.use(express.json({ limit: '10kb' }));

// nettoyage des données contre les injections de requêtes NoSQL
app.use(mongoSanitize());

// nettoyage des données contre les attaques XSS
app.use(xss());

// prévention de la pollution des paramètres. La whitelist contient les champs autorisés en doublons
app.use(
    hpp({
        whitelist: ['client', 'quote', 'bill', 'status', 'projectType', 'name'],
    })
);

app.use((req, res, next) => {
    req.requestTime = new Date().toLocaleTimeString();
    next();
});

// ITINERAIRES

app.use('/projects', projectRouter);
app.use('/users', userRouter);
app.use('/bills', billRouter);

// gestion des routes qui n'existent pas
app.all('*', (req, res, next) => {
    next(new AppError(`Impossible de trouver ${req.originalUrl} sur ce serveur`));
});

// WATCH GESTION DES ERREURS

// Middleware principal de gestion des erreurs. Récupère les erreurs et renvoie une réponse JSON au lieu du html
app.use(globalErrorHandler);

// exporte l'app express pour le server
module.exports = app;
