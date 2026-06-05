const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'BreakdownRequest', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Can be User or Workshop
  senderRole: { type: String, enum: ['user', 'workshop'], required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
