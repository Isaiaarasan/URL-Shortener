const { check } = require('express-validator');

const createUrlRules = [
  check('originalUrl')
    .notEmpty()
    .withMessage('Original URL is required')
    .trim()
    .isURL()
    .withMessage('Please enter a valid URL (including http:// or https://)'),
  check('customAlias')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .matches(/^[a-zA-Z0-9-_]+$/)
    .withMessage('Custom alias can only contain alphanumeric characters, hyphens, and underscores')
    .isLength({ min: 3, max: 30 })
    .withMessage('Custom alias must be between 3 and 30 characters'),
  check('expiresAt')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Expiration date must be a valid ISO 8601 date string')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Expiration date must be in the future');
      }
      return true;
    })
];

const updateUrlRules = [
  check('originalUrl')
    .notEmpty()
    .withMessage('Original URL is required')
    .trim()
    .isURL()
    .withMessage('Please enter a valid URL (including http:// or https://)'),
  check('expiresAt')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Expiration date must be a valid ISO 8601 date string')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Expiration date must be in the future');
      }
      return true;
    })
];

module.exports = {
  createUrlRules,
  updateUrlRules
};
