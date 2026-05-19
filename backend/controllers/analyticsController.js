const Url = require('../models/Url');
const Visit = require('../models/Visit');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * @desc    Get detailed analytics for a URL (Owner Only)
 * @route   GET /api/urls/:id/analytics
 * @access  Private
 */
const getAnalytics = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    const url = await Url.findOne({ _id: id, userId });
    if (!url) {
      return errorResponse(res, 404, 'URL not found or not authorized to view analytics.');
    }

    // Get latest visit
    const latestVisit = await Visit.findOne({ urlId: url._id }).sort({ timestamp: -1 });
    const lastVisited = latestVisit ? latestVisit.timestamp : null;

    // Get recent 20 visits
    const recentVisits = await Visit.find({ urlId: url._id })
      .sort({ timestamp: -1 })
      .limit(20)
      .select('timestamp ip userAgent');

    // Aggregate daily clicks for the past 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyVisits = await Visit.aggregate([
      {
        $match: {
          urlId: url._id,
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Populate missing dates with 0 count to prevent charting gaps
    const dailyClicks = [];
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - i);
      const dateString = targetDate.toISOString().split('T')[0];
      
      const record = dailyVisits.find(v => v._id === dateString);
      dailyClicks.push({
        date: dateString,
        count: record ? record.count : 0
      });
    }

    return successResponse(res, 200, {
      url: {
        shortCode: url.shortCode,
        originalUrl: url.originalUrl,
        createdAt: url.createdAt
      },
      totalClicks: url.clicks,
      lastVisited,
      recentVisits,
      dailyClicks
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * @desc    Get public high-level stats for any short link
 * @route   GET /api/stats/:shortCode
 * @access  Public
 */
const getPublicStats = async (req, res) => {
  const { shortCode } = req.params;

  try {
    const url = await Url.findOne({ shortCode }).select('shortCode originalUrl clicks createdAt');
    if (!url) {
      return errorResponse(res, 404, 'Short link not found.');
    }

    // Get latest visit timestamp
    const latestVisit = await Visit.findOne({ urlId: url._id }).sort({ timestamp: -1 });
    const lastVisited = latestVisit ? latestVisit.timestamp : null;

    return successResponse(res, 200, {
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      clicks: url.clicks,
      createdAt: url.createdAt,
      lastVisited
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

module.exports = {
  getAnalytics,
  getPublicStats
};
