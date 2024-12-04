const { body, validationResult } = require('express-validator');

const distributorValidationRules = () => {
  return [
    body('companyname')
      .notEmpty().withMessage('Company name is required.'),
    body('location')
      .notEmpty().withMessage('Location is required'),
    body('gstnumber')
      .notEmpty().withMessage('GST Number is required'),
    body('creditlimit')
      .notEmpty().withMessage('Credit limit is required')
      .isFloat({ min: 0 }).withMessage('Credit limit must be a valid positive number.'),
    body('contact_person_name')
      .notEmpty().withMessage('Contact person name is required'),
    body('phoneno')
      .notEmpty().withMessage('Phone number is required')
      .isLength({ min: 10, max: 15 }).withMessage('Phone number should be between 10 and 15 digits.')
      .isNumeric().withMessage('Phone number must contain only digits.'),
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Email must be a valid email address.'),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password should be min 6 charactors.'),
      body('image')
      .custom((value, { req }) => {
  
          if (!req.files || req.files.length === 0) {
              return false; // This will trigger the first withMessage
          }
          // Check maximum number of files
          if (req.files.length > 1) {
              return false; // This will trigger the second withMessage
          }
          return true;
      })
      .withMessage('Please upload at least one image file.')
      .withMessage('You can upload a maximum of 1 image files.')
  ];
};


const validateDistributor = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  distributorValidationRules,
  validateDistributor
};
