const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema(
  {
    urlId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Url',
      required: [true, 'Associated URL ID is required']
    },
    shortCode: {
      type: String,
      required: true,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true
    },
    ip: {
      type: String,
      required: true
    },
    userAgent: {
      type: String,
      default: 'Unknown'
    }
  }
);

// High-performance indexes
visitSchema.index({ urlId: 1 });
visitSchema.index({ shortCode: 1 });
visitSchema.index({ timestamp: 1 });
visitSchema.index({ urlId: 1, timestamp: -1 }); // Compound index for chronological recent visits

module.exports = mongoose.model('Visit', visitSchema);
