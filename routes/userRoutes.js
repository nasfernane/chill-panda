//Modules
const express = require('express');
// Controller Utilisateurs, qui contient les méthodes à appliquer au routeur en fonction des différentes requêtes http.
const userController = require('../controllers/userController');
// Controller d'authentification pour gérer toutes les procédures liées au login, création d'un nouvel utilisateur ou à ses droits d'accès
const authController = require('../controllers/authController');

// création d'un routeur grâce au middleware d'express
const router = express.Router();

// itinéraire création utilisateur
router.post('/signup', authController.signup);
// itinéraire login utilisateur
router.post('/login', authController.login);
// suppression ancien mdp et envoi token aléatoire temporaire par mail
router.post('/forgotPassword', authController.forgotPassword);
// création du nouveau mdp
router.patch('/resetPassword/:token', authController.resetPassword);
// maj mdp pour utilisateur déjà connecté
router.patch('/updatePassword', authController.protect, authController.updatePassword);
// maj données utilisateur
router.patch('/updateUserData', authController.protect, userController.updateUserData);

// itinéraire général pour récupérer tous les utilisateurs ou en créer un nouveau
router.route('/').get(userController.getAllUsers).post(userController.createUser);
// itinéraire général sur l'id, pour récupérer un utilisateur, l'update, ou le supprimer
router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

// exporte le module pour app.js
module.exports = router;
