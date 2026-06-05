const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Admin = require('./models/Admin');
const Workshop = require('./models/Workshop');
const ServiceCategory = require('./models/ServiceCategory');
const Vehicle = require('./models/Vehicle');
const BreakdownRequest = require('./models/BreakdownRequest');
const Review = require('./models/Review');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/onroad_breakdown');
    console.log('MongoDB Connected for Seeding...');

    // Clear existing
    await User.deleteMany();
    await Admin.deleteMany();
    await Workshop.deleteMany();
    await ServiceCategory.deleteMany();
    await Vehicle.deleteMany();
    await BreakdownRequest.deleteMany();
    await Review.deleteMany();

    // 1. Admin
    const salt = await bcrypt.genSalt(12);
    const adminPass = await bcrypt.hash('admin', salt);
    await Admin.create({
      name: 'Super Admin',
      email: 'admin',
      password: adminPass
    });

    // 2. Categories
    const categories = await ServiceCategory.insertMany([
      { name: 'Flat Tyre', description: 'Tyre puncture repair or replacement', basePrice: 500, icon: 'tyre' },
      { name: 'Battery Jump Start', description: 'Jump start a dead battery', basePrice: 400, icon: 'battery' },
      { name: 'Engine Failure', description: 'Engine diagnostics and minor repair', basePrice: 1500, icon: 'engine' },
      { name: 'Fuel Delivery', description: 'Emergency fuel delivery up to 5L', basePrice: 300, icon: 'fuel' },
      { name: 'Towing', description: 'Flatbed towing to nearest garage', basePrice: 2000, icon: 'tow' }
    ]);

    console.log('Seeding completed successfully with only Admin & Categories!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedData();
