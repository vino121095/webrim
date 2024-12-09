const { body, param, validationResult } = require('express-validator');

// Validation rules for adding to cart
const addToCartValidationRules = () => {
  return [
    body('user_id')
      .notEmpty()
      .withMessage('User ID is required.')
      .isInt({ min: 1 })
      .withMessage('User ID must be a positive integer.'),
    
    body('product_id')
      .notEmpty()
      .withMessage('Product ID is required.')
      .isString()
      .withMessage('Product ID must be a string.')
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Product ID must be between 1 and 255 characters.'),
    
    body('product_name')
      .notEmpty().withMessage('Product name is required.')
      .withMessage('Product name must be a string.')
      .trim()
      .isLength({ min: 1})
      .withMessage('Product name must be between 1 and 255 characters.'),
    body('quantity')
      .notEmpty()
      .withMessage('Quantity is required.')
      .isInt({ min: 1})
      .withMessage('Quantity must be an integer 1.'),
    
    body('distributor_name')
    .notEmpty().withMessage('Distributor is required.')
      .isString()
      .trim(),
    
    // body('distributor_location')
    //   .isString()
    //   .trim()
    //   .withMessage('Distributor location must not exceed 255 characters.'),
    
    body('phone_number')
      .optional()
      .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)
      .withMessage('Invalid phone number format.'),
  ];
};

// Validation rules for updating cart quantity
const updateCartValidator = () => {
  return [
    param('id')
      .notEmpty()
      .withMessage('Cart ID is required.')
      .isInt({ min: 1 })
      .withMessage('Cart ID must be a positive integer.'),
    body('quantity')
      .notEmpty()
      .withMessage('Quantity is required.')
      .isInt({ min: 1})
      .withMessage('Quantity must be an integer 1.'),
  ];
};


// Middleware to handle validation errors
const validateAddToCart = (req, res, next) => {
  const errors = validationResult(req);
  
  // If there are validation errors
  if (!errors.isEmpty()) {
    // Map errors to a more readable format
    const formattedErrors = errors.array().map(error => ({
      field: error.path,
      message: error.msg
    }));

    return res.status(400).json({
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
  next();
};

module.exports = {
  addToCartValidationRules, 
  updateCartValidator, 
  validateAddToCart
};