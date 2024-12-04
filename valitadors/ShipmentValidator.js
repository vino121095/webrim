const { body, validationResult } = require('express-validator');

const shipmentValidationRules = () => [
    body('order_id').notEmpty().withMessage('Order ID is required'),
    body('distributor_name').notEmpty().withMessage('Distributor name is required'),
    body('product_id').isArray({ min: 1 }).withMessage('Product ID must be a non-empty array'),
    body('quantity').isArray({ min: 1 }).withMessage('Quantity must be a non-empty array'),
    body('dispatch_date').notEmpty().withMessage('Dispatch Date is required'),
    body('dispatch_address').notEmpty().withMessage('Dispatch Address is required'),
    body('transport').notEmpty().withMessage('Transport is required'),
];

const validateShipment = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = {
    shipmentValidationRules,
    validateShipment
};