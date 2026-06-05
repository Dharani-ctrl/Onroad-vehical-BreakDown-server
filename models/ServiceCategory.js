const mongoose = require('mongoose');

const serviceCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  basePrice: { type: Number, default: 0 },
  icon: { type: String } // optional icon url
}, { timestamps: true });

module.exports = mongoose.model('ServiceCategory', serviceCategorySchema);
