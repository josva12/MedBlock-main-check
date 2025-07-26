const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, enum: ['health', 'finance', 'educational'] },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reactions: {
    happy: { type: Number, default: 0 },
    sad: { type: Number, default: 0 },
    helpful: { type: Number, default: 0 },
    unhelpful: { type: Number, default: 0 },
    neutral: { type: Number, default: 0 },
  },
  // User-specific reactions to track who reacted what
  userReactions: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reaction: { type: String, enum: ['happy', 'sad', 'helpful', 'unhelpful', 'neutral'], required: true }
  }],
  // User-specific ratings
  userRatings: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true }
  }],
  createdAt: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for average rating
ResourceSchema.virtual('averageRating').get(function() {
  if (this.userRatings.length === 0) return 0;
  const sum = this.userRatings.reduce((acc, curr) => acc + curr.rating, 0);
  return Math.round((sum / this.userRatings.length) * 10) / 10; // Round to 1 decimal
});

// Virtual for total ratings count
ResourceSchema.virtual('totalRatings').get(function() {
  return this.userRatings.length;
});

module.exports = mongoose.model('Resource', ResourceSchema); 