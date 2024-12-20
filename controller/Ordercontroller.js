// Create a new order
const { sequelize } = require('../config/db');
const AddToCart = require('../model/AddToCartModel');
const Order = require('../model/Ordermodel');
const OrderItem = require('../model/OrderItemModel'); // Assume this model stores individual order items
const Product = require('../model/Productmodel');
const ProductImage = require('../model/productImagesmodel');
const User = require('../model/UserModel');
const { where } = require('sequelize');
const Transport = require('../model/Transportmodel');
const Shipment = require('../model/Shipmentmodel');
const Distributor = require('../model/Distributorsmodel');
 
exports.createOrder = async (req, res) => {
    try {
        const userId = req.body.user_id;
        const transportId = req.body.transport_id;

        // Fetch all cart items for the user
        const cartItems = await AddToCart.findAll({
            where: { user_id: userId },
            include: [{ model: Product, as: 'product' }],
        });

        if (cartItems.length === 0) {
            return res.json({ error: 'No items in the cart' });
        }

        // Calculate total amount
        const totalAmount = cartItems.reduce((sum, item) => {
            return sum + item.quantity * item.product.mrp_rate;
        }, 0);

        // Fetch user details
        const user = await User.findOne({
            where: { uid: userId }
        });

        if (!user) {
            return res.json({ error: 'User not found' });
        }

        // Fetch distributor details
        const distributor = await Distributor.findOne({
            where: { email: user.email }
        });

        if (!distributor) {
            return res.json({ error: 'Distributor not found' });
        }

        // Check if the distributor has sufficient credit limit
        if (distributor.current_credit_limit < totalAmount) {
            return res.json({ error: 'Insufficient credit limit' });
        }

        // Create the order
        const newOrder = await Order.create({
            order_id: req.order_id,
            user_id: userId,
            order_date: req.order_date,
            total_amount: totalAmount,
            status: 'Received',
            transport_id: transportId
        });

        // Add items to the order
        const orderItemsData = cartItems.map(item => ({
            order_id: newOrder.order_id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.product.mrp_rate
        }));
        await OrderItem.bulkCreate(orderItemsData);

        // Remove items from the cart
        await AddToCart.destroy({
            where: { user_id: userId }
        });

        /// Update distributor's credit limit
        const updatedCreditLimit = distributor.current_credit_limit - totalAmount;
        await Distributor.update(
            { current_credit_limit: updatedCreditLimit },
            { where: { email: user.email } }
        );
        await User.update({
            current_credit_limit:updatedCreditLimit},
            {where:{uid:userId}
        })

        res.status(201).json({
            message: 'Order placed successfully',
            order: newOrder,
            orderItems: orderItemsData,
            updatedCreditLimit
        });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ error: 'Failed to place order', details: error.message });
    }
};

 

// Cancel Order API
exports.cancelOrder = async (req, res) => {
    try {
        const id = req.params.id;

        // Find the order to check its status and total amount
        const order = await Order.findOne({
            where: { oid: id }
        });

        // Check if the order exists
        if (!order) {
            return res.json({ message: 'Order not found' });
        }

        // Check if the order can be canceled
        if (order.status === 'Done' || order.status === 'Cancelled') {
            return res.json({ message: 'Order cannot be canceled at this stage' });
        }

        // Fetch the user and distributor associated with the order
        const user = await User.findOne({ where: { uid: order.user_id } });
        const distributor = await Distributor.findOne({ where: { email: user.email } });

        if (!user || !distributor) {
            return res.json({ message: 'User or Distributor not found' });
        }

        // Update the credit limits (refund the total amount)
        const refundedAmount = Number(order.total_amount); // Ensure refundedAmount is a number
        const updatedUserCredit = Number(user.current_credit_limit) + refundedAmount;
        const updatedDistributorCredit = Number(distributor.current_credit_limit) + refundedAmount;

        await User.update(
            { current_credit_limit: updatedUserCredit },
            { where: { uid: order.user_id } }
        );

        await Distributor.update(
            { current_credit_limit: updatedDistributorCredit },
            { where: { email: user.email } }
        );

        // Update the order status to 'Cancelled'
        await Order.update(
            {
                status: 'Cancelled',
                cancelAt: new Date()
            },
            { where: { oid: id } }
        );

        res.status(200).json({
            message: 'Order successfully canceled',
            refundedAmount,
            updatedUserCredit,
            updatedDistributorCredit
        });
    } catch (error) {
        console.error('Error canceling order:', error);
        return res.status(500).json({
            message: 'Failed to cancel order',
            error: error.message
        });
    }
};


// Complete/Done Order API
exports.completeOrder = async (req, res) => {
  try {
    const id = req.params.id;

    // Find the order first to check its current status
    const order = await Order.findOne({
        where :{
            oid:id
        }
    });

    // Check if order exists
    if (!order) {
      return res.status(404).json({ 
        message: 'Order not found' 
      });
    }

    // Check if order can be marked as completed
    if (order.status === 'Done' || order.status === 'Canceled') {
      return res.json({ 
        message: 'Order cannot be marked as completed' 
      });
    }

    // Update order status to completed
    await Order.update(
      { 
        status: 'Done',
        completeAt: new Date() 
      }, 
      { 
        where: { oid:id } 
      }
    );

    await Shipment.update(
        {
          status: 'Delivered'
        },
        {
          where: { order_id: order.order_id } // Adjust the foreign key field name if it's different
        }
      );

    // Optional: Add any additional completion logic
    // For example, triggering notifications, generating invoices, etc.

    return res.status(200).json({ 
      message: 'Order successfully completed',
      id 
    });

  } catch (error) {
    console.error('Error completing order:', error);
    return res.status(500).json({ 
      message: 'Failed to complete order', 
      error: error.message 
    });
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

exports.getAllOrdersForNotify = async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [
                {
                    model: User, 
                    as: 'user',
                    attributes: ['username']
                },
                {
                    model: OrderItem,
                    include: [{
                        model: Product,
                        include: [{
                            model: ProductImage,
                            as: 'images',
                            attributes: ['image_path']
                        }]
                    }]
                }
            ],
            order: [
                ['updatedAt', 'DESC'], // Orders updated most recently first
                ['createdAt', 'DESC']  // Fallback to creation date if no updates
            ]
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
            include: [
                {
                    model: User, 
                    as: 'user',
                    attributes: ['uid', 'username', 'email']
                },
                {
                model: OrderItem,
                include: [{
                    model: Product
                }]
            },
            {
                model: Transport,
                as: 'transport',
                attributes: ['travels_name'] 
            }
        ]
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