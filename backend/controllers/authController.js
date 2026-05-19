const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Helper to sign JWT
const signToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, 'User already exists with this email address.');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash: password // hashed automatically in model pre-save hook
    });

    const token = signToken(user._id);

    return successResponse(
      res,
      201,
      {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        }
      },
      'User registered successfully'
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * @desc    Authenticate user and get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, 401, 'Invalid email or password credentials.');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 401, 'Invalid email or password credentials.');
    }

    const token = signToken(user._id);

    return successResponse(
      res,
      200,
      {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        }
      },
      'Logged in successfully'
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    return successResponse(res, 200, { user: req.user });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

module.exports = {
  signup,
  login,
  getMe
};
