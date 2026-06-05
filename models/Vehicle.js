const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['car', 'bike', 'truck', 'van'], required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  plate: { type: String, required: true },
  photo: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
