const { validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    
    return res.status(400).json({
      status: 'error',
      message: 'Geçersiz veri',
      errors: errorMessages
    });
  }
  
  next();
};

module.exports = handleValidationErrors;
