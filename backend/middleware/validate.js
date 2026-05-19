const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/responseHelper');

/**
 * Middleware that intercepts validation chains and responds with errors if validation fails
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));
    return errorResponse(res, 400, 'Validation failed', formattedErrors);
  }
  next();
};

module.exports = validate;
