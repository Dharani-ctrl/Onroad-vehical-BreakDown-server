const mongoose = require('mongoose');

const workshopSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional, could link to a generic user account if needed
  shopName: { type: String, required: true },
  ownerName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  specializations: [{ type: String }],
  vehicleTypes: [{ type: String }],
  isApproved: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  averageRating: { type: Number, default: 0 },
  totalJobs: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  photos: [{ type: String }],
  documents: [{ type: String }]
}, { timestamps: true });

workshopSchema.index({ 'location.lat': 1, 'location.lng': 1 });

module.exports = mongoose.model('Workshop', workshopSchema);
