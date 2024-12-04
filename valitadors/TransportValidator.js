const { body, validationResult } = require('express-validator');

const transportValidationRules = [
    body('travels_name').notEmpty().withMessage('Travel name is required.'),
    body('location').notEmpty().withMessage('Location is required.'),
    body('dirver_name').notEmpty().withMessage('Driver name is required.'),
    body('contact_person_name').notEmpty().withMessage('Contact person name is required.'),
    body('phone')
        .notEmpty().withMessage('Phone number is required.')
        .isNumeric().withMessage('Phone number must contain only digits.')
        .isLength({ min: 10, max: 15 }).withMessage('Phone number must be between 10 and 15 digits.'),
    body('email')
        .notEmpty().withMessage('Email is required.')
        .isEmail().withMessage('Invalid email format.')
];

const validateTransport = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = {
    transportValidationRules,
    validateTransport
};