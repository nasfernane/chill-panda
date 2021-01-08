//Modules
const express = require('express');
// Controller Utilisateurs, qui contient les méthodes à appliquer au routeur en fonction des différentes requêtes http.
const userController = require('../controllers/userController');
// Controller d'authentification pour gérer toutes les procédures liées au login, création d'un nouvel utilisateur ou à ses droits d'accès
const authController = require('../controllers/authController');

// création d'un routeur grâce au middleware d'express
const router = express.Router();

// itinéraire auto-création utilisateur
router.post('/signup', authController.signup);
// itinéraire login utilisateur
router.post('/login', authController.login);
// suppression ancien mdp et envoi token aléatoire temporaire par mail
router.post('/forgotpassword', authController.forgotPassword);
// création du nouveau mdp
router.patch('/resetpassword/:token', authController.resetPassword);

// rend obligatoire la connexion pour tous les itinéraires ci-dessous
router.use(authController.protect);

// maj mdp pour utilisateur déjà connecté
router.patch('/updatepassword', authController.updatePassword);
// récupération par l'utilisateur de ses données
router.get('/me', userController.getMe, userController.getUser);
// maj données utilisateur
router.patch('/updateme', userController.updateUserData);
// désactivation de son compte
router.delete('/deleteme', userController.deleteMe);

// rend obligatoire la connexion en tant qu'admin pour tous les itinéraires ci-dessous
router.use(authController.restrictTo('admin'));

// itinéraire général pour récupérer tous les utilisateurs ou en créer un nouveau
router.route('/').get(userController.getAllUsers).post(userController.createUser);
// itinéraire général sur l'id, pour récupérer un utilisateur, l'update, ou le supprimer (versions admins)
router
    .route('/:id')
    .get(userController.getUser)
    .patch(authController.protect, userController.updateUser)
    .delete(authController.protect, userController.deleteUser);

// exporte le module pour app.js
module.exports = router;
