// OrderRoutes.js
const express = require('express');
const router = express.Router();
const OrderController = require('../controller/Ordercontroller');  // Ensure correct casing and path
const { orderValidator } = require('../valitadors/OrderValidator');
const {generateOrderId, addOrderDate} = require('../middlewares/generateUinqueId');
// Route to place an order with validation
router.post('/placeOrder', generateOrderId, addOrderDate,  orderValidator, OrderController.createOrder);

// Route to get all orders
router.get('/orders', OrderController.getAllOrders);

router.get('/ordersfornotify', OrderController.getAllOrdersForNotify);

// Route to get orders by user ID
router.get('/userOrdersById/:id', OrderController.getOrdersByUserId);

router.get('/order/:id', OrderController.getOrderById);

module.exports = router;