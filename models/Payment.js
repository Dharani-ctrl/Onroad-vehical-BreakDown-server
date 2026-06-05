const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'BreakdownRequest', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workshopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop', required: true },
  amount: { type: Number, required: true },
  commission: { type: Number, required: true },
  workshopEarning: { type: Number, required: true },
  method: { type: String, enum: ['online', 'cash'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  transactionId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
