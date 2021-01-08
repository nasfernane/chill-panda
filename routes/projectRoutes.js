const express = require('express');
// importe les controllers, sous forme de méthodes qui seront appliquées au retour pour répondre aux différentes requêtes http
const projectController = require('../controllers/projectController');
const authController = require('../controllers/authController');
const billRouter = require('./billRoutes');

// création du routeur avec le middleware d'express
const router = express.Router();
// monte le routeur des factures pour tu lui transmettre toutes les url de type /:projectid/bills
router.use('/:projectid/bills', billRouter);

// rend obligatoire la connexion pour tous les itinéraires ci-dessous
router.use(authController.protect);

router.route('/').get(projectController.getAllProjects).post(projectController.createProject);
router
    .route('/:id')
    .get(projectController.getProject)
    .patch(projectController.updateProject)
    .delete(projectController.deleteProject);

module.exports = router;
