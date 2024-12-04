const { body, validationResult } = require('express-validator');

const productValidationRules =()=>{ 
    return [
    body('product_name').notEmpty().withMessage('Product name is required.'),
    body('mrp_rate')
        .notEmpty().withMessage('MRP Rate is required.')
        .isNumeric().withMessage('MRP Rate must contain only digits')
        .isFloat({ min: 1 }).withMessage('MRP Rate must be at least 1.'),
    body('distributors_rate')
        .notEmpty().withMessage('Distributor rate is required.')
        .isNumeric().withMessage('Distributor Rate must contain only digits')
        .isFloat({ min: 1 }).withMessage('Distributor Rate must be at least 1.'),
    body('technicians_rate')
        .notEmpty().withMessage('Technicians rate is required.')
        .isNumeric().withMessage('Technicians rate must contain only digits')
        .isFloat({ min: 1 }).withMessage('Technicians rate must be at least 1.'),
    body('brand_name').notEmpty().withMessage('Brand name is required.'),
    body('product_description').notEmpty().withMessage('Product description is required.'),
    body('stocks')
        .notEmpty().withMessage('Stocks are required.')
        .isNumeric().withMessage('Stocks must contain only digits.')
        .isInt({ min: 10 }).withMessage('Stock must be at least 10.'),
    body('how_to_use').notEmpty().withMessage('How to use is required.'),
    body('composition').notEmpty().withMessage('Composition is required.'),
    body('item_details').notEmpty().withMessage('Item details are required.'),
    body('organization_name').notEmpty().withMessage('Organization name is required.'),
    body('images')
    .custom((value, { req }) => {

        if (!req.files || req.files.length === 0) {
            return false; // This will trigger the first withMessage
        }
        // Check maximum number of files
        if (req.files.length > 3) {
            return false; // This will trigger the second withMessage
        }
        return true;
    })
    .withMessage('Please upload at least one image file.')
    .withMessage('You can upload a maximum of 3 image files.')
]};

const validateProduct = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = {
    productValidationRules,
    validateProduct
};
