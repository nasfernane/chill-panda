const express = require('express');
const viewsController = require('../controllers/viewsController');

const router = express.Router();

router.get('/', viewsController.getOverview);

router.get('/project/:id', viewsController.getProject);

module.exports = router;
