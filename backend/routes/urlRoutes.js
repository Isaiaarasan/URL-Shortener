const express = require('express');
const router = express.Router();
const { createUrl, getUrls, updateUrl, deleteUrl } = require('../controllers/urlController');
const { getAnalytics } = require('../controllers/analyticsController');
const { createUrlRules, updateUrlRules } = require('../validators/urlValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');

// Secure all URL CRUD endpoints with JWT Protection
router.use(protect);

// CREATE and READ
router.route('/')
  .post(createUrlRules, validate, createUrl)
  .get(getUrls);

// Private analytics route (Owner Only)
router.get('/:id/analytics', getAnalytics);

// UPDATE and DELETE
router.route('/:id')
  .put(updateUrlRules, validate, updateUrl)
  .delete(deleteUrl);

module.exports = router;
