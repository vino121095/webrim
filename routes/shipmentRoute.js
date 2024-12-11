
const express = require('express');
const router = express.Router();
const shipmentController = require('../controller/Shipmemtcontroller');
const { shipmentValidationRules, validateShipment } = require('../valitadors/ShipmentValidator');
const { generateShipmentId } = require('../middlewares/generateUinqueId');

router.get('/getAllShipments',shipmentController.getAllShipments);

router.get('/getShipment/:id',shipmentController.getShipmentById);

router.post('/shipments', shipmentValidationRules(), validateShipment, generateShipmentId, shipmentController.createShipments);

router.put('/updateShipment/:sid', shipmentController.updateShipment);

router.delete('/deleteShipment/:sid', shipmentController.deleteShipment);

module.exports = router;