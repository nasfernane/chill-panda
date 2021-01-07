const express = require('express');
const billController = require('../controllers/billController');
const authController = require('../controllers/authController');

//

// création du routeur avec le middleware d'express
const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(authController.protect, billController.getAllBills)
    .post(authController.protect, billController.createBill);

router
    .route('/:id')
    .get(authController.protect, billController.getBill)
    .delete(authController.protect, billController.deleteBill);

module.exports = router;
