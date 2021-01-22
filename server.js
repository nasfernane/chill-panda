// librairie mongoose pour mongoDB, rajoute une couche d'abstraction pour faciliter la création de schéma, la gestion des queries, etc.
const mongoose = require('mongoose');
// module dotenv pour charger des variables environnementales depuis un fichier .env
const dotenv = require('dotenv');

// gestion des exceptions/erreurs // synchrones. A garder en début de code pour catch correctement.
process.on('uncaughtException', err => {
    console.log('Attention, erreur ! 💥 Fermeture du server...');
    console.log(err.name, err.message);
    // on ferme l'application
    process.exit(1);
});

// définit le chemin du fichier de configuration pour les variables environnementales. A garder avant le require app pour lire les infos avant son execution.
dotenv.config({ path: './config.env' });

// import de l'app express
const app = require('./app');

// stocke l'accès avec l'identifiant et le mdp contenus dans config.env
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
console.log(DB);
console.log(process.env.NODE_ENV);

// connexion à la database
mongoose
    .connect(DB, {
        // échappe certains warnings de  dépréciation
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    })
    .then(console.log('DB connection success'));

// définit le port pour heroku ou en local
const port = process.env.PORT || 8000;
// on ajoute un écouteur pour log le port sur lequel on évolue
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

// gestion des promesses rejetées
process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log('Rejet de la requête ! 💥 Fermeture du serveur... ');
    // on ferme le serveur, puis l'application
    server.close(() => {
        // uncaught exception (code 1)
        process.exit(1);
    });
});
