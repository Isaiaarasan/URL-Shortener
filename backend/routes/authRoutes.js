const express = require('express');
const router = express.Router();
const { signup, login, getMe } = require('../controllers/authController');
const { signupRules, loginRules } = require('../validators/authValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

// Signup Route (Public, Rate Limited)
router.post('/signup', authLimiter, signupRules, validate, signup);

// Login Route (Public, Rate Limited)
router.post('/login', authLimiter, loginRules, validate, login);

// Fetch Current User Details (Private)
router.get('/me', protect, getMe);

module.exports = router;
