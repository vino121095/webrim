const crypto = require('crypto');

// Middleware to generate unique IDs
exports.generateOrderId = (req, res, next) => {
    req.order_id = 'ORD-' + crypto.randomUUID().slice(0, 8);
    next();
};

exports.generateShipmentId = (req, res, next) =>{
    req.shipment_id = 'SHP-' + crypto.randomUUID().slice(0, 8); 
    next();
}

exports.addOrderDate = (req, res, next) => {
    const order_date= new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    req.order_date = order_date;
    next();
};