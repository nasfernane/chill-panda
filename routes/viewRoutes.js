const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const projectController = require('../controllers/projectController');

const router = express.Router();

router.get('/', viewsController.getLoginForm);
router.get('/signup', viewsController.getSignupForm);

router.get('/overview', authController.protect, viewsController.getOverview);
router.get('/project/:id', authController.protect, viewsController.getProject);
router.get('/project/:id/edit', authController.protect, viewsController.editProject);
router.get('/newproject', authController.protect, viewsController.newProject);
router.get('/account', authController.protect, viewsController.getAccount);
router.get('/stats', authController.protect, viewsController.getBillingStats);

module.exports = router;
