const mongoose = require('mongoose');
const ResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String }, // e.g., "diabetes", "malaria", "insurance"
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Resource', ResourceSchema); 