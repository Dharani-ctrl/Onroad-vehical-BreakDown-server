const User = require('../models/User');
const Workshop = require('../models/Workshop');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

exports.register = async (req, res) => {
  try {
    const { role } = req.body; // 'user' or 'workshop'

    if (role === 'workshop') {
      const { shopName, ownerName, email, phone, password, address, lat, lng, specializations } = req.body;
      const exists = await Workshop.findOne({ email });
      if (exists) return res.status(400).json({ message: 'Email already registered' });

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      const workshop = await Workshop.create({
        shopName, ownerName, email, phone, password: hashedPassword,
        address, location: { lat, lng }, specializations
      });

      return res.status(201).json({ message: 'Registration successful, pending admin approval', _id: workshop._id });
    } else {
      const { name, email, phone, password } = req.body;
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: 'Email already registered' });

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({ name, email, phone, password: hashedPassword });
      const token = generateToken(res, user._id, 'user');
      
      return res.status(201).json({ 
        _id: user._id, name: user.name, email: user.email, role: 'user', token 
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    let account = null;

    if (role === 'admin') account = await Admin.findOne({ email });
    else if (role === 'workshop') account = await Workshop.findOne({ email });
    else account = await User.findOne({ email });

    if (!account) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    if (role === 'workshop' && !account.isApproved) {
      return res.status(403).json({ message: 'Account pending admin approval' });
    }
    if ((role === 'workshop' && account.isBlocked) || (role === 'user' && !account.isActive)) {
      return res.status(403).json({ message: 'Account is blocked by admin' });
    }

    const token = generateToken(res, account._id, role);

    const payload = { _id: account._id, email: account.email, role };
    if (role === 'user' || role === 'admin') payload.name = account.name;
    if (role === 'workshop') payload.name = account.shopName;

    res.status(200).json({ ...payload, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.logout = (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: 'Logged out successfully' });
};

exports.forgotPassword = async (req, res) => {
  res.status(200).json({ message: 'Forgot password email sent (mock)' });
};

exports.resetPassword = async (req, res) => {
  res.status(200).json({ message: 'Password reset successful (mock)' });
};

exports.getMe = async (req, res) => {
  try {
    // Requires authMiddleware to set req.user
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });

    let account = null;
    if (req.user.role === 'admin') account = await Admin.findById(req.user.id).select('-password');
    else if (req.user.role === 'workshop') account = await Workshop.findById(req.user.id).select('-password');
    else account = await User.findById(req.user.id).select('-password');

    if (!account) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ ...account._doc, role: req.user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
