const express = require('express');
const router = express.Router();

const LocationController = require('../controller/Locationcontroller');

router.get('/states', LocationController.fetchStates);

router.get('/districts/:id', LocationController.fetchDistricts);

module.exports = router;