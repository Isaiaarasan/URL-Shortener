const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner userId is required']
    },
    originalUrl: {
      type: String,
      required: [true, 'Original destination URL is required'],
      trim: true
    },
    shortCode: {
      type: String,
      required: [true, 'Short code is required'],
      unique: true,
      trim: true
    },
    customAlias: {
      type: Boolean,
      default: false
    },
    clicks: {
      type: Number,
      default: 0
    },
    expiresAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes for high performance
urlSchema.index({ shortCode: 1 }, { unique: true });
urlSchema.index({ userId: 1 });
urlSchema.index({ userId: 1, createdAt: -1 }); // Compound index for fast dashboard pagination
urlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // MongoDB TTL auto-expirer index

module.exports = mongoose.model('Url', urlSchema);
