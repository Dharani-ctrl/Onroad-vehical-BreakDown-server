const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'BreakdownRequest', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workshopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
