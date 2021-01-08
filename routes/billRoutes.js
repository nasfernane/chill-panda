const express = require('express');
const billController = require('../controllers/billController');
const authController = require('../controllers/authController');

// création du routeur avec le middleware d'express
const router = express.Router({ mergeParams: true });

// rend obligatoire la connexion pour tous les itinéraires
router.use(authController.protect);

router
    .route('/')
    .get(billController.getAllBills)
    .post(billController.checkBeforeCreateBill, billController.createBill);

router
    .route('/:id')
    .patch(billController.updateBill)
    .get(billController.getBill)
    .delete(billController.deleteBill);

module.exports = router;
