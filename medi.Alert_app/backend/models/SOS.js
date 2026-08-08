const mongoose = require('mongoose');

const sosSchema = mongoose.Schema(
  {
    id: { type: String, required: true },
    status: { type: String, required: true },
    priority: { type: String, required: true },
    patientName: { type: String },
    ageGender: { type: String },
    location: { type: String },
    condition: { type: String },
    allergies: { type: String },
    symptoms: { type: String },
    contactPhone: { type: String },
    vitals: {
      heartRate: Number,
      bp: String,
      spo2: Number,
      respRate: Number,
      shockIndex: Number,
      shockStatus: String,
    },
    telemetry: {
      speed: Number,
      lat: Number,
      lng: Number,
      greenCorridor: Boolean,
      eta: String,
    },
    driver: {
      name: String,
      unit: String,
      vehicleReg: String,
      phone: String,
    },
    hospital: {
      name: String,
      rating: Number,
      bed: String,
      address: String,
      doctor: String,
      doctorPhone: String,
    },
  },
  {
    timestamps: true,
  }
);

const SOS = mongoose.model('SOS', sosSchema);

module.exports = SOS;
