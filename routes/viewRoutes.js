const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', viewsController.getLoginForm);
router.get('/signup', viewsController.getSignupForm);

router.get('/overview', authController.protect, viewsController.getOverview);
router.get('/project/:id', authController.protect, viewsController.getProject);
router.get('/account', authController.protect, viewsController.getAccount);

module.exports = router;
