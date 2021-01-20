const express = require('express');
const billController = require('../controllers/billController');
const authController = require('../controllers/authController');

// création du routeur avec le middleware d'express
const router = express.Router({ mergeParams: true });

// rend obligatoire la connexion pour tous les itinéraires
// router.use(authController.protect);

router
    .route('/')
    .get(authController.protect, billController.getAllBills)
    .post(authController.protect, billController.checkBeforeCreateBill, billController.createBill);

router
    .route('/:id')
    .patch(authController.protect, billController.updateBill)
    .get(authController.protect, billController.getBill)
    .delete(authController.protect, billController.deleteBill);

module.exports = router;
