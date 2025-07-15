const mongoose = require('mongoose');
const SubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  facilityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility' },
  plan: { type: String, enum: ['basic', 'premium'], required: true },
  status: { type: String, enum: ['active', 'expired', 'pending'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  paymentMethod: { type: String, enum: ['mpesa', 'card'], default: 'mpesa' },
  mpesaReceipt: { type: String }
});
module.exports = mongoose.model('Subscription', SubscriptionSchema); 