const express = require('express');
const router = express.Router();
const transportController = require('../controller/Transportcontroller');
const { transportValidationRules, validateTransport } = require('../valitadors/TransportValidator');

// Create transport
router.post('/addtransport', transportValidationRules, validateTransport, transportController.createTransport);

// Get all transports
router.get('/transport', transportController.getAllTransports);

// Get transport by ID
router.get('/transport/:id', transportController.getTransportById);

// Update transport
router.put('/updatetransport/:id', transportValidationRules, validateTransport, transportController.updateTransport);

// Delete transport
router.delete('/deletetransport/:id', transportController.deleteTransport);

module.exports = router;