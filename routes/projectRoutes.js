const express = require('express');

// controllers
const projectController = require('../controllers/projectController');
const authController = require('../controllers/authController');

// router des factures
const billRouter = require('./billRoutes');

// création du routeur avec le middleware d'express
const router = express.Router();

// redirige toutes les url de type /:projectid/bills vers le routeur des factures
router.use('/:projectid/bills', billRouter);

// rend obligatoire la connexion pour tous les itinéraires qui suivent
router.use(authController.protect);

router.route('/').get(projectController.getAllProjects).post(projectController.createProject);
router
    .route('/:id')
    .get(projectController.getProject)
    .patch(projectController.updateProject)
    .delete(projectController.deleteProject);

module.exports = router;
