const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/medalert')
  .then(async () => {
    console.log('Connected to DB');
    const EmergencyCase = require('./models/EmergencyCase');
    const result = await EmergencyCase.updateMany(
      { status: { $ne: 'COMPLETED' } }, 
      { $set: { status: 'COMPLETED' } }
    );
    console.log('Cleared active SOS:', result);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
