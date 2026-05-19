/**
 * Standardizes API responses across the application
 */
const successResponse = (res, statusCode, data, message = null) => {
  const response = { success: true };
  if (message) response.message = message;
  if (data) response.data = data;
  return res.status(statusCode).json(response);
};

const errorResponse = (res, statusCode, message, errors = null) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  errorResponse
};
