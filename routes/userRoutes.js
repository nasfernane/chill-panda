//Modules
const express = require('express');
// importe le controller Utilisateurs, qui contient les méthodes à appliquer au routeur en fonction des différentes requêtes http.
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// création d'un routeur grâce au middleware d'express
const router = express.Router();

// itinéraire création utilisateur
router.post('/signup', authController.signup);
// itinéraire login utilisateur
router.post('/login', authController.login);

router.route('/').get(userController.getAllUsers).post(userController.createUser);
router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

// exporte le module pour app.js
module.exports = router;
