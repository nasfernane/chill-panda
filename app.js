const express = require('express');
// middleware qui renvoie un log des requêtes http
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

//routeurs
const projectRouter = require('./routes/projectRoutes.js');
const userRouter = require('./routes/userRoutes');

// création de l'app express
const app = express();

// MIDDLEWARES
//

// log les requêtes sur server avec Morgan si le process est en mode développement
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
app.use(express.json());

app.use((req, res, next) => {
    console.log('Welcome to Chill panda');
    next();
});

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