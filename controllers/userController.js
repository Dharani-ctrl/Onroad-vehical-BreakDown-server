const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const BreakdownRequest = require('../models/BreakdownRequest');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { name, phone }, { new: true }).select('-password');
    res.json({ message: 'Profile updated', user });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!await bcrypt.compare(oldPassword, user.password)) {
      return res.status(400).json({ message: 'Incorrect old password' });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ userId: req.user.id });
    res.json(vehicles);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addVehicle = async (req, res) => {
  try {
    const { type, brand, model, year, plate, photo } = req.body;
    const vehicle = await Vehicle.create({
      userId: req.user.id, type, brand, model, year, plate, photo
    });
    res.status(201).json({ message: 'Vehicle added', vehicle });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json({ message: 'Vehicle updated', vehicle });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json({ message: 'Vehicle deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getRequests = async (req, res) => {
  try {
    const requests = await BreakdownRequest.find({ userId: req.user.id })
      .populate('workshopId', 'shopName phone location rating')
      .populate('vehicleId', 'brand model plate')
      .populate('problemType', 'name')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getActiveRequest = async (req, res) => {
  try {
    const activeReq = await BreakdownRequest.findOne({ 
      userId: req.user.id, 
      status: { $in: ['pending', 'accepted', 'enroute', 'arrived', 'inprogress'] } 
    }).populate('workshopId', 'shopName phone location rating')
      .populate('vehicleId', 'brand model plate')
      .populate('problemType', 'name');
    res.json(activeReq || null);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getRequestById = async (req, res) => {
  try {
    const request = await BreakdownRequest.findOne({ _id: req.params.id, userId: req.user.id })
      .populate('workshopId', 'shopName phone location rating')
      .populate('vehicleId', 'brand model plate')
      .populate('problemType', 'name');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json(request);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const request = await BreakdownRequest.findOne({
      _id: req.params.id,
      userId: req.user.id,
      status: 'completed'
    });
    if (!request) return res.status(404).json({ message: 'Completed request not found' });
    if (request.userRating) return res.status(400).json({ message: 'You have already rated this service' });

    // Save rating on request
    request.userRating = rating;
    request.userComment = comment || '';
    await request.save();

    // Recalculate workshop average rating
    if (request.workshopId) {
      const Workshop = require('../models/Workshop');
      const allRatings = await BreakdownRequest.find({
        workshopId: request.workshopId,
        userRating: { $exists: true, $ne: null }
      }).select('userRating');

      const avg = allRatings.reduce((sum, r) => sum + r.userRating, 0) / allRatings.length;
      await Workshop.findByIdAndUpdate(request.workshopId, {
        averageRating: Math.round(avg * 10) / 10
      });
    }

    res.json({ message: 'Review submitted successfully', rating, comment });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getPayments = async (req, res) => {
  try {
    const requests = await BreakdownRequest.find({ userId: req.user.id, status: 'completed' });
    res.json(requests);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.payRequest = async (req, res) => {
  try {
    const { method } = req.body;
    if (!['online', 'cash'].includes(method)) return res.status(400).json({ message: 'Invalid payment method' });
    
    const request = await BreakdownRequest.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, status: 'completed', paymentStatus: 'pending' },
      { paymentStatus: 'paid', paymentMethod: method },
      { new: true }
    );
    if (!request) return res.status(404).json({ message: 'Request not found or already paid' });
    res.json({ message: 'Payment successful', request });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.requestRefund = async (req, res) => {
  try {
    const request = await BreakdownRequest.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, status: 'cancelled', paymentStatus: 'paid' },
      { paymentStatus: 'refunded' },
      { new: true }
    );
    if (!request) return res.status(404).json({ message: 'No eligible cancelled request found for refund' });
    res.json({ message: 'Refund processed successfully', request });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
