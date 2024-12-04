const { body, validationResult } = require('express-validator');

const forumValidationRules = () => {
  return [
    body('product_name')
      .notEmpty().withMessage('Product name is required.'),
    body('quantity')
      .notEmpty().withMessage('Quantity is required.')
      .isInt({ min: 1 }).withMessage('Quantity must be a positive integer.'),
    body('name')
      .notEmpty().withMessage('Name is required.'),
    body('phone_number')
      .notEmpty().withMessage('Phone number is required.')
      .isLength({ min: 10, max: 15 }).withMessage('Phone number should be between 10 and 15 digits.')
      .isNumeric().withMessage('Phone number must contain only digits.'),
  ];
};

const validateForum = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  forumValidationRules,
  validateForum,
};
