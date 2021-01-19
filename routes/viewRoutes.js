const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.isLoggedIn);

router.get('/', viewsController.getLoginForm);
router.get('/signup', viewsController.getSignupForm);
router.get('/account', viewsController.getAccount);
router.get('/overview', authController.protect, viewsController.getOverview);
router.get('/project/:id', authController.protect, viewsController.getProject);


module.exports = router;
