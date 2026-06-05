const User = require('../models/User');
const Workshop = require('../models/Workshop');
const BreakdownRequest = require('../models/BreakdownRequest');
const ServiceCategory = require('../models/ServiceCategory');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

/* ─── DASHBOARD STATS ─── */
exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalWorkshops, activeRequests, completedJobs, pendingApprovals, revenueAgg] = await Promise.all([
      User.countDocuments(),
      Workshop.countDocuments({ isApproved: true }),
      BreakdownRequest.countDocuments({ status: { $in: ['accepted', 'enroute', 'arrived', 'inprogress'] } }),
      BreakdownRequest.countDocuments({ status: 'completed' }),
      Workshop.countDocuments({ isApproved: false }),
      BreakdownRequest.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$serviceCharge' } } }
      ])
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;
    res.json({ totalUsers, totalWorkshops, activeRequests, completedJobs, pendingApprovals, totalRevenue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── USER MANAGEMENT ─── */
exports.addUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password || 'user123', salt);
    const user = await User.create({ name, email, phone, password: hash });
    res.status(201).json({ message: 'User created', user: { _id: user._id, name: user.name, email: user.email } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = { $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ]};
    }
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('vehicles');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const history = await BreakdownRequest.find({ userId: req.params.id })
      .populate('problemType', 'name')
      .populate('workshopId', 'shopName')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ user, history });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { name, email, phone }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User updated', user });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.blockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User blocked', user });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.unblockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User unblocked', user });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ─── WORKSHOP MANAGEMENT ─── */
exports.addWorkshop = async (req, res) => {
  try {
    const { shopName, ownerName, email, phone, password, address } = req.body;
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password || 'workshop123', salt);
    const workshop = await Workshop.create({
      shopName, ownerName, email, phone, password: hash, address, isApproved: true,
      location: { lat: 0, lng: 0 }
    });
    res.status(201).json({ message: 'Workshop created', workshop: { _id: workshop._id, shopName: workshop.shopName } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getWorkshops = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { shopName: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (status === 'pending') query.isApproved = false;
    else if (status === 'approved') query.isApproved = true;

    const workshops = await Workshop.find(query).select('-password').sort({ createdAt: -1 });
    res.json(workshops);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getWorkshopById = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id).select('-password');
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });
    const jobs = await BreakdownRequest.find({ workshopId: req.params.id, status: 'completed' }).countDocuments();
    res.json({ workshop, completedJobs: jobs });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.approveWorkshop = async (req, res) => {
  try {
    const workshop = await Workshop.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true }).select('-password');
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });
    res.json({ message: 'Workshop approved', workshop });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.rejectWorkshop = async (req, res) => {
  try {
    await Workshop.findByIdAndDelete(req.params.id);
    res.json({ message: 'Workshop rejected and removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateWorkshop = async (req, res) => {
  try {
    const { shopName, ownerName, phone, address } = req.body;
    const workshop = await Workshop.findByIdAndUpdate(
      req.params.id,
      { shopName, ownerName, phone, address },
      { new: true }
    ).select('-password');
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });
    res.json({ message: 'Workshop updated', workshop });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.blockWorkshop = async (req, res) => {
  try {
    const workshop = await Workshop.findByIdAndUpdate(req.params.id, { isBlocked: true }, { new: true }).select('-password');
    res.json({ message: 'Workshop blocked', workshop });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.unblockWorkshop = async (req, res) => {
  try {
    const workshop = await Workshop.findByIdAndUpdate(req.params.id, { isBlocked: false }, { new: true }).select('-password');
    res.json({ message: 'Workshop unblocked', workshop });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteWorkshop = async (req, res) => {
  try {
    await Workshop.findByIdAndDelete(req.params.id);
    res.json({ message: 'Workshop deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ─── REQUEST MANAGEMENT ─── */
exports.getRequests = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status && status !== 'all') query.status = status;
    const requests = await BreakdownRequest.find(query)
      .populate('userId', 'name email phone')
      .populate('workshopId', 'shopName phone')
      .populate('problemType', 'name')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getRequestById = async (req, res) => {
  try {
    const request = await BreakdownRequest.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('workshopId', 'shopName phone email address')
      .populate('vehicleId')
      .populate('problemType', 'name');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json(request);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.assignWorkshop = async (req, res) => {
  try {
    const { workshopId } = req.body;
    const request = await BreakdownRequest.findByIdAndUpdate(
      req.params.id,
      { workshopId, status: 'accepted' },
      { new: true }
    );
    res.json({ message: 'Workshop assigned', request });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.cancelRequest = async (req, res) => {
  try {
    const request = await BreakdownRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled', cancelReason: req.body.reason || 'Cancelled by admin' },
      { new: true }
    );
    res.json({ message: 'Request cancelled', request });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ─── SERVICE CATEGORIES ─── */
exports.getCategories = async (req, res) => {
  try {
    const cats = await ServiceCategory.find().sort({ name: 1 });
    res.json(cats);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addCategory = async (req, res) => {
  try {
    const { name, description, basePrice, icon } = req.body;
    const cat = await ServiceCategory.create({ name, description, basePrice, icon });
    res.status(201).json(cat);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateCategory = async (req, res) => {
  try {
    const cat = await ServiceCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(cat);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteCategory = async (req, res) => {
  try {
    await ServiceCategory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ─── REPORTS ─── */
exports.getRevenueReport = async (req, res) => {
  try {
    const monthly = await BreakdownRequest.aggregate([
      { $match: { status: 'completed' } },
      { $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        revenue: { $sum: { $ifNull: ['$serviceCharge', 0] } },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    res.json(monthly || []);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getRequestsReport = async (req, res) => {
  try {
    const byStatus = await BreakdownRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    res.json({ byStatus: byStatus || [], byType: [] });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ─── ADMIN PROFILE ─── */
exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    res.json(admin);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateAdminProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const update = { name, email };
    if (password) {
      const salt = await bcrypt.genSalt(12);
      update.password = await bcrypt.hash(password, salt);
    }
    const admin = await Admin.findByIdAndUpdate(req.user.id, update, { new: true }).select('-password');
    res.json({ message: 'Profile updated', admin });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
