// Create a new order
const { sequelize } = require('../config/db');
const AddToCart = require('../model/AddToCartModel');
const Order = require('../model/Ordermodel');
const OrderItem = require('../model/OrderItemModel'); // Assume this model stores individual order items
const Product = require('../model/Productmodel');
const ProductImage = require('../model/productImagesmodel');
const User = require('../model/UserModel');
 
exports.createOrder = async (req, res) => {
    try {
        const userId = req.body.user_id;
 
        // Fetch all cart items for the user
        const cartItems = await AddToCart.findAll({
            where: { user_id: userId },
            include: [{ model: Product, as: 'product' }],
        });
 
        if (cartItems.length === 0) {
            return res.status(404).json({ error: 'No items in the cart' });
        }
 
        // Calculate total amount
        const totalAmount = cartItems.reduce((sum, item) => {
            return sum + item.quantity * item.product.mrp_rate;
        }, 0);
 
        // Create the order
        const newOrder = await Order.create({
            order_id: req.order_id,
            user_id: userId,
            order_date: req.order_date,
            total_amount: totalAmount,
            status: 'Received'
        });
 
        // Add items to the order
        const orderItemsData = cartItems.map(item => ({
            order_id: newOrder.order_id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.product.mrp_rate
        }));
        await OrderItem.bulkCreate(orderItemsData);
 
        await AddToCart.destroy({
            where: { user_id: userId }
        });
        res.status(201).json({
            message: 'Order placed successfully',
            order: newOrder,
            orderItems: orderItemsData
        });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ error: 'Failed to place order', details: error.message });
    }
};
 
 
// Get all orders
 
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [
                {
                    model: User, 
                    as: 'user',
                    attributes: ['username']
                },{
                model: OrderItem,
                include: [{
                    model: Product,
                    include: [{
                        model: ProductImage,
                        as :'images' ,
                        attributes:['image_path']
                    }]
                }]
            }]
        });
 
        if (!orders || orders.length === 0) {
            return res.json({
                message: 'No orders found'
            });
        }
        res.status(200).json({
            message: 'Orders retrieved successfully',
            data: orders
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            error: 'Failed to retrieve orders',
            details: error.message
        });
    }
};
 
// Get orders by user ID
exports.getOrdersByUserId = async (req, res) => {
    try {
        const { id } = req.params;
        const orders = await Order.findAll({
            where: { user_id: id }, // Assuming 'user_id' is the correct field for the user
            include: [{
                model: OrderItem,
                include: [{
                    model: Product
                }]
            }]
        });
 
        if (orders.length === 0) {
            return res.json({
                message: 'No orders found for this user',data : []
            });
        }
 
        res.status(200).json({
            message: 'Orders retrieved successfully',
            data: orders
        });
    } catch (error) {
        console.error('Error fetching orders by user ID:', error);
        res.status(500).json({ error: 'Failed to retrieve orders', details: error.message });
    }
};
exports.getOrderById = async (req, res) => {
    try {
        const oid = req.params.id;
        const order = await Order.findByPk(oid, {
            include: [{
                model: OrderItem,
                include: [{
                    model: Product
                }]
            }]
        });
 
        if (!order) {
            return res.json({
                message: 'Order not found',
                data: null
            });
        }
 
        res.status(200).json({
            message: 'Order retrieved successfully',
            data: order
        });
    } catch (error) {
        console.error('Error fetching order by OID:', error);
        res.status(500).json({ error: 'Failed to retrieve order', details: error.message });
    }
};