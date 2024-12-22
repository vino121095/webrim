const { body, validationResult } = require('express-validator');

const forumValidationRules = () => {
  return [
    body('name')
      .notEmpty().withMessage('Name is required.'),
    body('phone_number')
      .notEmpty().withMessage('Phone number is required.')
      .matches(/^\d{10,15}$/).withMessage('Phone number must be between 10 and 15 digits.'),
    body('close_date')
      .notEmpty().withMessage('Close date is required.')
      .isISO8601().withMessage('Invalid date format.'),
    body('forumProducts')
      .isArray().withMessage('Products must be an array')
      .notEmpty().withMessage('At least one product is required'),
    body('forumProducts.*.product_name')
      .notEmpty().withMessage('Product name is required.'),
    body('forumProducts.*.quantity')
      .notEmpty().withMessage('Quantity is required.')
      .isInt({ min: 1 }).withMessage('Quantity must be a positive integer.')
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
