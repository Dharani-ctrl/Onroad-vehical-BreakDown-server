const mongoose = require('mongoose');

const breakdownRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workshopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop' },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  problemType: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory' },
  description: { type: String, required: true },
  photos: [{ type: String }],
  breakdownLocation: {
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'enroute', 'arrived', 'inprogress', 'completed', 'cancelled'],
    default: 'pending'
  },
  eta: { type: Number }, // in minutes
  serviceCharge: { type: Number },
  completionPhotos: [{ type: String }],
  cancelReason: { type: String },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  paymentMethod: { type: String, enum: ['online', 'cash'] },
  userRating: { type: Number, min: 1, max: 5 },
  userComment: { type: String }
}, { timestamps: true });

// For finding nearby requests
breakdownRequestSchema.index({ 'breakdownLocation.lat': 1, 'breakdownLocation.lng': 1 });

module.exports = mongoose.model('BreakdownRequest', breakdownRequestSchema);
