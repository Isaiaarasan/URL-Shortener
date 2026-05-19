const crypto = require('crypto');

/**
 * Generates a random alphanumeric short code of a given length
 * @param {number} length 
 * @returns {string}
 */
const generateShortCode = (length = 7) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
};

module.exports = generateShortCode;
