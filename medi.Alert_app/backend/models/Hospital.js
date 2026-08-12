const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  capacity: {
    icu: { type: Number, default: 0 },
    general: { type: Number, default: 0 }
  },
  availableResources: [{ type: String }], // e.g., "Cardiologist", "Trauma Surgeon", "Cath Lab"
}, { timestamps: true });

module.exports = mongoose.model('Hospital', hospitalSchema);
