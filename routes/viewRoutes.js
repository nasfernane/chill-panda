const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();


router.get('/', viewsController.getLoginForm);
router.get('/signup', viewsController.getSignupForm);

router.use(authController.protect)

router.get('/overview', viewsController.getOverview);
router.get('/project/:id', viewsController.getProject);
router.get('/account', viewsController.getAccount);

module.exports = router;
