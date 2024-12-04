const { body, validationResult } = require('express-validator');

// Register validation rules
const userRegistrationValidationRules = () => {
    return [
        body('username')
            .notEmpty().withMessage('Username is required.')
            .isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters.')
            .isAlphanumeric().withMessage('Username can only contain letters and numbers.'),
        body('email')
            .notEmpty().withMessage('Email is required.')
            .isEmail().withMessage('Please provide a valid email address.')
            .normalizeEmail(),
        body('password')
            .notEmpty().withMessage('Password is required.')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
        body('confirm_password')
            .notEmpty().withMessage('Confirm password is required.')
            .custom((value, { req }) => value === req.body.password).withMessage('Password and confirm password do not match.')
    ];
};
const adminRegistrationValidationRules = () => {
    return [
        body('email')
            .notEmpty().withMessage('Email is required.')
            .isEmail().withMessage('Please provide a valid email address.')
            .normalizeEmail(),
        body('password')
            .notEmpty().withMessage('Password is required.')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
    ];
};

// Login validation rules
const userLoginValidationRules = () => {
    return [
        body('email')
        .notEmpty().withMessage('Email is required.')
        .isEmail().withMessage('Please provide a valid email address.')
        .normalizeEmail(),
        body('password')
            .notEmpty().withMessage('Password is required.')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.')
    ];
};

// Validation result handler
const validateUser = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = {
    userRegistrationValidationRules,
    adminRegistrationValidationRules,
    userLoginValidationRules,
    validateUser
};
