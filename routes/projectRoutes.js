const express = require('express');
// importe les controllers, sous forme de méthodes qui seront appliquées au retour pour répondre aux différentes requêtes http
const projectController = require('../controllers/projectController');
const authController = require('../controllers/authController');
const billController = require('../controllers/billController');
const billRouter = require('./billRoutes');

// création du routeur avec le middleware d'express
const router = express.Router();
// monte le routeur des factures pour tu lui transmettre toutes les url de type /:projectid/bills
router.use('/:projectid/bills', billRouter);

// on lui applique les méthodes du Controller
router
    .route('/')
    .get(authController.protect, projectController.getAllProjects)
    .post(authController.protect, projectController.createProject);
router
    .route('/:id')
    .get(projectController.getProject)
    .patch(projectController.updateProject)
    .delete(
        authController.protect,
        authController.restrictTo('admin', 'papa-panda', 'bebe-panda'),
        projectController.deleteProject
    );

module.exports = router;
