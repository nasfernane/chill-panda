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
// maj mdp pour utilisateur déjà connecté
router.patch('/updatepassword', authController.protect, authController.updatePassword);
// maj données utilisateur
router.patch('/updateuserdata', authController.protect, userController.updateUserData);
router.delete('/deleteme', authController.protect, userController.deleteMe);

// itinéraire général pour récupérer tous les utilisateurs ou en créer un nouveau
router.route('/').get(userController.getAllUsers).post(userController.createUser);

// itinéraire général sur l'id, pour récupérer un utilisateur, l'update, ou le supprimer (versions admins)
router
    .route('/:id')
    .get(userController.getUser)
    .patch(authController.protect, authController.restrictTo('admin'), userController.updateUser)
    .delete(authController.protect, authController.restrictTo('admin'), userController.deleteUser);

// exporte le module pour app.js
module.exports = router;
