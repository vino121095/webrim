const { body } = require('express-validator');

const orderValidator = [
    body('order_id').notEmpty().withMessage('Order ID is required'),
    body('user_id').notEmpty().withMessage('User ID is required'),
    body('order_date')
        .notEmpty().withMessage('Order date is required')
        .custom((value) => {
            // Manually check if it's a valid date
            if (isNaN(Date.parse(value))) {
                throw new Error('Valid order date is required');
            }
            return true;
        }),
    body('total_amount')
        .notEmpty().withMessage('Total amount is required')
        .isDecimal().withMessage('Total amount must be a decimal'),
    body('status').notEmpty().withMessage('Order status is required')
];

module.exports = { orderValidator };