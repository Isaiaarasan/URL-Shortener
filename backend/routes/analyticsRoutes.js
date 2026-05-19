const express = require('express');
const router = express.Router();
const { getPublicStats } = require('../controllers/analyticsController');

// Public aggregate stats for links
router.get('/stats/:shortCode', getPublicStats);

module.exports = router;
