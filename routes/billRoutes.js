const express = require('express');
const billController = require('../controllers/billController');
const authController = require('../controllers/authController');

//

// création du routeur avec le middleware d'express
const router = express.Router();

router.route('/').get(authController.protect, billController.getAllBills);

module.exports = router;
