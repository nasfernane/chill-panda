const express = require('express');
// importe les controllers, sous forme de méthodes qui seront appliquées au retour pour répondre aux différentes requêtes http
const projectController = require('../controllers/projectController');
const authController = require('../controllers/authController');

// création du routeur avec le middleware d'express
const router = express.Router();

// on lui applique les méthodes du Controller
router
    .route('/')
    .get(authController.protect, projectController.getAllProjects)
    .post(projectController.createProject);
router
    .route('/:id')
    .get(projectController.getProject)
    .patch(projectController.updateProject)
    .delete(projectController.deleteProject);

module.exports = router;
