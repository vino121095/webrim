const Shipment = require('../model/Shipmentmodel');
const OrderItem = require('../model/OrderItemModel');
const Product = require('../model/Productmodel');
const Order = require('../model/Ordermodel');
const { where } = require('sequelize');
const Notification = require('../model/NotificationModel');

// Helper function for creating notifications
const createOrderNotification = async (userId, orderId, status, message) => {
    try {
        await Notification.create({
            user_id: userId,
            order_id: orderId,
            type: 'order',
            title: `Order ${status}`,
            message: message,
            status: status,
            is_read: false,
            created_at: new Date()
        });
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

exports.createShipments = async (req, res) => {
    try {
        const { 
            order_id, 
            product_id, 
            distributor_name, 
            quantity, 
            dispatch_date, 
            dispatch_address, 
            transport,
            courier_id 
        } = req.body;

        // Validate input
        if (!order_id || !product_id || !quantity || 
            product_id.length !== quantity.length) {
            return res.status(400).json({ 
                error: 'Invalid input: product_ids and quantities must match' 
            });
        }

        // Check if order exists
        const order = await Order.findOne({ where: { order_id } });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Validate products and calculate total shipment details
        const shipmentItems = [];
        let totalPrice = 0;

        for (let i = 0; i < product_id.length; i++) {
            const orderItem = await OrderItem.findOne({ 
                where: { 
                    order_id, 
                    product_id: product_id[i] 
                },
                include: [{ model: Product }] 
            });

            if (!orderItem) {
                return res.status(400).json({ 
                    error: `Product ${product_id[i]} is not part of the order`
                });
            }

            if (quantity[i] > orderItem.quantity) {
                return res.status(400).json({ 
                    error: `Quantity for product ${product_id[i]} exceeds order quantity`
                });
            }

            shipmentItems.push({
                product_id: product_id[i],
                product_name: orderItem.Product.product_name,
                quantity: quantity[i],
                price: orderItem.price * quantity[i]
            });

            totalPrice += orderItem.price * quantity[i];
        }

        const shipment_id = req.shipment_id;

        const shipmentData = {
            shipment_id,
            order_id,
            distributor_name,
            total_quantity: shipmentItems.reduce((sum, item) => sum + item.quantity, 0),
            total_price: totalPrice,
            dispatch_date,
            dispatch_address,
            transport,
            courier_id,
            shipment_items: shipmentItems
        };

        // Create shipment
        await Shipment.create(shipmentData);

        // Update order status
        await Order.update({ status: 'Shipping' }, { where: { order_id } });

        // Create shipping notification
        await createOrderNotification(
            order.user_id,
            order.order_id,
            'Shipping',
            `Your order #${order.order_id} is now being shipped.`
        );

        const shipment = await Shipment.findOne({
            where: {
                shipment_id: shipmentData.shipment_id
            }
        });

        res.status(201).json({
            message: "Shipment created successfully with multiple products",
            shipment: shipment
        });

    } catch (error) {
        console.error('Error creating shipment:', error);
        res.status(500).json({ 
            error: 'Failed to create shipment', 
            details: error.message 
        });
    }
};

exports.getAllShipments = async (req, res) => {
    try {
        const shipments = await Shipment.findAll();

        if (!shipments || shipments.length === 0) {
            return res.status(404).json({ message: 'No shipments found' });
        }

        res.status(200).json({
            message: 'Shipments retrieved successfully',
            data: shipments,
        });
    } catch (error) {
        console.error('Error retrieving shipments:', error);
        res.status(500).json({
            error: 'Failed to retrieve shipments',
            details: error.message,
        });
    }
};

exports.getShipmentById = async (req, res) => {
    try {
        const shipment_id = req.params.id;
        console.log(shipment_id)

        const shipment = await Shipment.findOne({ where: { sid: shipment_id } });

        if (!shipment) {
            return res.status(404).json({ error: 'Shipment not found' });
        }

        res.status(200).json({
            message: 'Shipment details retrieved successfully',
            data: shipment
        });
    } catch (error) {
        console.error('Error retrieving shipment:', error);
        res.status(500).json({
            error: 'Failed to retrieve shipment',
            details: error.message,
        });
    }
};
exports.updateShipment = async (req, res) => {
    try {
        const { sid } = req.params;
        const { 
            distributor_name, 
            dispatch_date, 
            dispatch_address, 
            transport,
            courier_id,
            status
        } = req.body;

        // Check if shipment exists
        const shipment = await Shipment.findOne({ 
            where: { sid: sid } 
        });

        if (!shipment) {
            return res.status(404).json({ 
                error: 'Shipment not found' 
            });
        }

        // Update shipment details
        await Shipment.update({
            distributor_name,
            dispatch_date,
            dispatch_address,
            transport,
            courier_id,
            status
        }, {
            where: { sid: sid }
        });
        let orderstatus;
        if(status === 'Delivered'){
            orderstatus = 'Done'
        }
        else if(status === 'Cancelled'){
            orderstatus = 'Cancelled'
        }
        else{
            orderstatus = 'Shipping'
        }
        
        await Order.update({ status: orderstatus}, { where: { order_id: shipment.order_id } })

        // Fetch updated shipment
        const updatedShipment = await Shipment.findOne({
            where: { sid: sid }
        });

        res.status(200).json({
            message: 'Shipment updated successfully',
            data: updatedShipment
        });

    } catch (error) {
        console.error('Error updating shipment:', error);
        res.status(500).json({
            error: 'Failed to update shipment',
            details: error.message
        });
    }
};

exports.deleteShipment = async (req, res) => {
    try {
        const { sid } = req.params;

        // Find the shipment first to ensure it exists
        const shipment = await Shipment.findOne({ 
            where: { sid: sid } 
        });

        if (!shipment) {
            return res.status(404).json({ 
                error: 'Shipment not found' 
            });
        }

        // Delete the shipment
        await Shipment.destroy({
            where: { sid: sid }
        });
        await Order.destroy({
            where: { order_id: shipment.order_id }
        })


        res.status(200).json({ 
            message: 'Shipment deleted successfully',
            deletedShipmentId: sid
        });

    } catch (error) {
        console.error('Error deleting shipment:', error);
        res.status(500).json({ 
            error: 'Failed to delete shipment', 
            details: error.message 
        });
    }
};

