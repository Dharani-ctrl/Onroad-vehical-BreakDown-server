const mongoose = require('mongoose');
const Workshop = require('./models/Workshop');

mongoose.connect('mongodb://127.0.0.1:27017/onroad_breakdown')
  .then(async () => {
    const workshop = await Workshop.findOne();
    if (!workshop) { console.log("No workshop found"); process.exit(0); }
    
    // Set to true
    await Workshop.findByIdAndUpdate(workshop._id, { isAvailable: true });
    
    const w1 = await Workshop.findById(workshop._id);
    console.log("Before update:", w1.isAvailable);
    
    // Simulate completeJob update
    await Workshop.findByIdAndUpdate(workshop._id, {
      $inc: { totalJobs: 1, totalEarnings: 50 }
    });

    const w2 = await Workshop.findById(workshop._id);
    console.log("After update:", w2.isAvailable);
    process.exit(0);
  });
