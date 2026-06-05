const mongoose = require('mongoose');
require('dotenv').config();
const Workshop = require('./models/Workshop');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/onroad_assist')
  .then(async () => {
    try {
      const workshop = await Workshop.findOne();
      if (!workshop) {
        console.log("No workshops found");
        process.exit(0);
      }
      console.log("Found workshop:", workshop._id, workshop.shopName);
      
      const updated = await Workshop.findByIdAndUpdate(workshop._id, { isAvailable: !workshop.isAvailable }, { new: true });
      console.log("Updated workshop:", updated.isAvailable);
      process.exit(0);
    } catch (e) {
      console.error("Error:", e.message);
      process.exit(1);
    }
  });
