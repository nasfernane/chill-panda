const express = require('express');
// middlewares pour headers http
const helmet = require('helmet');
// middleware pour limiter le nombre de requêtes
const rateLimit = require('express-rate-limit');
// middleware qui renvoie un log des requêtes http
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

//routeurs
const projectRouter = require('./routes/projectRoutes.js');
const userRouter = require('./routes/userRoutes');

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

app.use((req, res, next) => {
    req.requestTime = new Date().toLocaleTimeString();
    next();
});

// WATCH ROUTES

// route pour les projets liés à la bdd
app.use('/projects', projectRouter);
// route pour les utilisateurs
app.use('/users', userRouter);

// gestion des routes qui n'existent pas
app.all('*', (req, res, next) => {
    next(new AppError(`Impossible de trouver ${req.originalUrl} sur ce serveur`));
});

// WATCH GESTION DES ERREURS

// Middleware principal de gestion des erreurs. Récupère les erreurs et renvoie une réponse JSON au lieu du html
app.use(globalErrorHandler);

// exporte l'app express pour le server
module.exports = app;
