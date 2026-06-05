const Workshop = require('../models/Workshop');
const BreakdownRequest = require('../models/BreakdownRequest');
const bcrypt = require('bcryptjs');

// Profile & Settings
exports.getProfile = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.user.id).select('-password');
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });
    res.json(workshop);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateProfile = async (req, res) => {
  try {
    const { shopName, ownerName, phone, address, specializations, vehicleTypes } = req.body;
    const workshop = await Workshop.findByIdAndUpdate(req.user.id, {
      shopName, ownerName, phone, address, specializations, vehicleTypes
    }, { new: true }).select('-password');
    res.json({ message: 'Profile updated', workshop });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const workshop = await Workshop.findById(req.user.id);
    if (!await bcrypt.compare(oldPassword, workshop.password)) {
      return res.status(400).json({ message: 'Incorrect old password' });
    }
    const salt = await bcrypt.genSalt(10);
    workshop.password = await bcrypt.hash(newPassword, salt);
    await workshop.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.toggleAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const workshop = await Workshop.findByIdAndUpdate(req.user.id, { isAvailable }, { new: true }).select('-password');
    res.json({ message: `Availability set to ${isAvailable ? 'Online' : 'Offline'}`, isAvailable: workshop.isAvailable });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (lat === undefined || lng === undefined) return res.status(400).json({ message: 'Lat and Lng required' });
    const workshop = await Workshop.findByIdAndUpdate(req.user.id, { location: { lat, lng } }, { new: true }).select('-password');
    res.json({ message: 'Location updated', location: workshop.location });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Requests & Jobs
exports.getIncomingRequests = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.user.id);
    if (!workshop.isAvailable) return res.json([]);
    
    // In a real app, calculate distance. Here we just return pending requests
    const requests = await BreakdownRequest.find({ status: 'pending' })
      .populate('userId', 'name phone')
      .populate('vehicleId', 'brand model plate')
      .populate('problemType', 'name')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.acceptRequest = async (req, res) => {
  try {
    const reqId = req.params.id;
    // ensure not accepted by someone else
    const request = await BreakdownRequest.findOneAndUpdate(
      { _id: reqId, status: 'pending' },
      { status: 'accepted', workshopId: req.user.id },
      { new: true }
    );
    if (!request) return res.status(400).json({ message: 'Request already accepted or not found' });
    res.json({ message: 'Request accepted', request });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.declineRequest = async (req, res) => {
  res.json({ message: 'Request declined' });
};

exports.updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await BreakdownRequest.findOneAndUpdate(
      { _id: req.params.id, workshopId: req.user.id },
      { status },
      { new: true }
    );
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json({ message: `Status updated to ${status}`, request });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateETA = async (req, res) => {
  try {
    const { eta } = req.body;
    const request = await BreakdownRequest.findOneAndUpdate(
      { _id: req.params.id, workshopId: req.user.id },
      { eta },
      { new: true }
    );
    res.json({ message: 'ETA updated', request });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.completeJob = async (req, res) => {
  try {
    const { serviceCharge, completionPhotos } = req.body;
    const request = await BreakdownRequest.findOneAndUpdate(
      { _id: req.params.id, workshopId: req.user.id },
      { status: 'completed', serviceCharge, completionPhotos },
      { new: true }
    );
    
    // Update workshop stats
    await Workshop.findByIdAndUpdate(req.user.id, {
      $inc: { totalJobs: 1, totalEarnings: serviceCharge || 0 }
    });

    res.json({ message: 'Job marked completed', request });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getHistory = async (req, res) => {
  try {
    const requests = await BreakdownRequest.find({ workshopId: req.user.id, status: { $in: ['completed', 'cancelled'] } })
      .populate('userId', 'name phone')
      .populate('vehicleId', 'brand model plate')
      .populate('problemType', 'name')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getEarnings = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.user.id);
    const requests = await BreakdownRequest.find({ workshopId: req.user.id, status: 'completed' });
    const totalEarnings = requests.reduce((sum, r) => sum + (r.serviceCharge || 0), 0);
    res.json({
      totalEarnings,
      completedJobs: workshop.totalJobs,
      rating: workshop.averageRating,
      requests
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getActiveJob = async (req, res) => {
  try {
    const job = await BreakdownRequest.findOne({
      workshopId: req.user.id,
      status: { $in: ['accepted', 'enroute', 'arrived', 'inprogress'] }
    }).populate('userId', 'name phone')
      .populate('vehicleId', 'brand model plate')
      .populate('problemType', 'name');
    res.json(job || null);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
