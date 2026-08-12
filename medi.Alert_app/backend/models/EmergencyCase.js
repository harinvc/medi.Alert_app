const mongoose = require('mongoose');

const emergencyCaseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // SOS-123456
  status: { type: String, enum: ['DISPATCHED', 'COMPLETED', 'PENDING'], default: 'PENDING' },
  patientName: { type: String, required: true },
  ageGender: { type: String },
  location: { type: String, required: true }, // Text address
  condition: { type: String },
  allergies: { type: String },
  chronicConditions: { type: String },
  medicalHistory: { type: Array, default: [] },
  symptoms: { type: String, required: true },
  emergencyContacts: [{
    name: String,
    phone: String,
    relationship: String
  }],
  
  // Vitals tracking
  vitals: {
    heartRate: Number,
    bp: String,
    spo2: Number,
    respRate: Number,
    shockIndex: Number,
    shockStatus: String
  },
  
  // Live Telemetry
  telemetry: {
    speed: Number,
    lat: Number,
    lng: Number,
    greenCorridor: Boolean,
    eta: String
  },
  
  // Assigned Resources
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  driver: {
    name: String,
    unit: String,
    vehicleReg: String,
    phone: String
  },

  // AI Triage Details
  aiTriage: {
    severity: { type: String, enum: ['RED', 'AMBER', 'GREEN'], default: 'AMBER' },
    requiredResources: [{ type: String }],
    summary: { type: String }
  }

}, { timestamps: true, id: false });

module.exports = mongoose.model('EmergencyCase', emergencyCaseSchema);
