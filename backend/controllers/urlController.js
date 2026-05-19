const Url = require('../models/Url');
const Visit = require('../models/Visit');
const generateShortCode = require('../utils/generateShortCode');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Helper to mask IP addresses for GDPR privacy compliance
const maskIp = (ipString) => {
  if (!ipString) return 'Unknown';
  if (ipString === '::1' || ipString === '127.0.0.1') {
    return '127.0.***.***';
  }
  if (ipString.includes(':')) {
    // IPv6 masking
    const parts = ipString.split(':');
    if (parts.length > 3) {
      return parts.slice(0, 3).join(':') + ':****:****:****';
    }
    return 'IPv6:****';
  }
  // IPv4 masking
  const parts = ipString.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.***.***`;
  }
  return 'Unknown';
};

/**
 * @desc    Create a short URL
 * @route   POST /api/urls
 * @access  Private
 */
const createUrl = async (req, res) => {
  const { originalUrl, customAlias, expiresAt } = req.body;
  const userId = req.user._id;

  try {
    let shortCode = '';
    let isCustom = false;

    if (customAlias) {
      const trimmedAlias = customAlias.trim();
      // Check if custom alias already exists in DB
      const existingAlias = await Url.findOne({ shortCode: trimmedAlias });
      if (existingAlias) {
        return errorResponse(res, 400, 'Custom alias is already in use. Please select another one.');
      }
      shortCode = trimmedAlias;
      isCustom = true;
    } else {
      // Auto-generate code and ensure uniqueness
      let attempts = 0;
      while (attempts < 5) {
        const candidateCode = generateShortCode(7);
        const codeExists = await Url.findOne({ shortCode: candidateCode });
        if (!codeExists) {
          shortCode = candidateCode;
          break;
        }
        attempts++;
      }
      if (!shortCode) {
        return errorResponse(res, 500, 'Failed to generate a unique short code. Please try again.');
      }
    }

    const shortUrl = `${process.env.BASE_URL}/${shortCode}`;

    const url = await Url.create({
      userId,
      originalUrl,
      shortCode,
      customAlias: isCustom,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    const responseData = {
      _id: url._id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl,
      clicks: url.clicks,
      expiresAt: url.expiresAt,
      createdAt: url.createdAt,
      updatedAt: url.updatedAt
    };

    return successResponse(res, 201, responseData, 'URL shortened successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * @desc    Get all URLs for a user with page/limit/search
 * @route   GET /api/urls
 * @access  Private
 */
const getUrls = async (req, res) => {
  const userId = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';

  try {
    const skip = (page - 1) * limit;

    // Filter matching user and search keyword
    const filterQuery = { userId };
    if (search) {
      filterQuery.originalUrl = { $regex: search, $options: 'i' };
    }

    const totalCount = await Url.countDocuments(filterQuery);
    const urls = await Url.find(filterQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Append shortUrl property in-memory
    const enrichedUrls = urls.map(url => ({
      ...url.toObject(),
      shortUrl: `${process.env.BASE_URL}/${url.shortCode}`
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return successResponse(res, 200, {
      urls: enrichedUrls,
      pagination: {
        currentPage: page,
        limit,
        totalPages,
        totalCount
      }
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * @desc    Update a URL (Destination Link and Expiry)
 * @route   PUT /api/urls/:id
 * @access  Private
 */
const updateUrl = async (req, res) => {
  const { id } = req.params;
  const { originalUrl, expiresAt } = req.body;
  const userId = req.user._id;

  try {
    const url = await Url.findOne({ _id: id, userId });
    if (!url) {
      return errorResponse(res, 404, 'URL not found or not authorized to update.');
    }

    if (originalUrl) url.originalUrl = originalUrl;
    if (expiresAt !== undefined) {
      url.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }

    await url.save();

    const responseData = {
      _id: url._id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
      clicks: url.clicks,
      expiresAt: url.expiresAt,
      createdAt: url.createdAt,
      updatedAt: url.updatedAt
    };

    return successResponse(res, 200, responseData, 'URL updated successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * @desc    Delete a URL and all associated visit logs
 * @route   DELETE /api/urls/:id
 * @access  Private
 */
const deleteUrl = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    const url = await Url.findOne({ _id: id, userId });
    if (!url) {
      return errorResponse(res, 404, 'URL not found or not authorized to delete.');
    }

    // Delete associated visit analytics
    await Visit.deleteMany({ urlId: url._id });
    // Delete link
    await Url.deleteOne({ _id: url._id });

    return successResponse(res, 200, { _id: id }, 'URL and its analytics were deleted successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * @desc    Redirect short code to original URL (Public)
 * @route   GET /:shortCode
 * @access  Public
 */
const redirectUrl = async (req, res) => {
  const { shortCode } = req.params;

  try {
    const url = await Url.findOne({ shortCode });
    if (!url) {
      return res.status(404).send('<h1>404 Not Found</h1><p>The short link does not exist.</p>');
    }

    // Check if expired
    if (url.expiresAt && new Date(url.expiresAt) <= new Date()) {
      return res.status(410).send('<h1>410 Gone</h1><p>This short link has expired.</p>');
    }

    // Atomic increment of clicks
    url.clicks += 1;
    await url.save();

    // Log the visit asynchronously for tracking
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const maskedIp = maskIp(clientIp);

    // Save visit log in background
    Visit.create({
      urlId: url._id,
      shortCode: url.shortCode,
      ip: maskedIp,
      userAgent
    }).catch(err => console.error(`Failed to record visit: ${err.message}`));

    // Redirect to destination
    return res.redirect(302, url.originalUrl);
  } catch (error) {
    return res.status(500).send('<h1>500 Internal Server Error</h1>');
  }
};

module.exports = {
  createUrl,
  getUrls,
  updateUrl,
  deleteUrl,
  redirectUrl
};
