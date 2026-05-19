require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { globalLimiter } = require('./middleware/rateLimiter');
const { errorResponse } = require('./utils/responseHelper');

// Import routes
const authRoutes = require('./routes/authRoutes');
const urlRoutes = require('./routes/urlRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const { redirectUrl } = require('./controllers/urlController');

// Initialize Express
const app = express();

// Connect to Database
connectDB();

// Global Middlewares
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    return callback(new Error('CORS blocked. Origin not allowed by config.'));
  },
  credentials: true
}));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply Rate Limiter globally
app.use(globalLimiter);

// API Status Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'LinkSnap Server is healthy and running operational.',
    timestamp: new Date()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);
app.use('/api', analyticsRoutes); // Mounts /api/stats/:shortCode

// Public redirect route (Must be registered at root level to catch http://domain/:shortCode)
app.get('/:shortCode', redirectUrl);

// Catch-all route for unmatched endpoints
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Centralized error handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error(`[Error Handler] ${err.stack}`);
  return errorResponse(res, statusCode, err.message || 'Internal Server Error');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 LinkSnap API Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
