// OrderRoutes.js
const express = require('express');
const router = express.Router();
const OrderController = require('../controller/Ordercontroller');  // Ensure correct casing and path
const { orderValidator } = require('../valitadors/OrderValidator');
const { generateOrderId, addOrderDate } = require('../middlewares/generateUinqueId');

// Route to place an order with validation
router.post('/placeOrder', generateOrderId, addOrderDate, orderValidator, OrderController.createOrder);

// Order management routes
router.put('/cancelOrder/:id', OrderController.cancelOrder);
router.put('/completeOrder/:id', OrderController.completeOrder);

// Order retrieval routes
router.get('/orders', OrderController.getAllOrders);
router.get('/ordersfornotify', OrderController.getAllOrdersForNotify);
router.get('/userOrdersById/:id', OrderController.getOrdersByUserId);
router.get('/order/:id', OrderController.getOrderById);

// Notification route
router.get('/notifications/:userId', OrderController.getOrderNotifications);

module.exports = router;