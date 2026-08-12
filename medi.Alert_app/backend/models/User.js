const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['patient', 'driver', 'doctor'],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: String,
    bloodGroup: String,
    organDonor: { type: Boolean, default: false },
    allergies: String,
    chronicConditions: String,
    physicianName: String,
    physicianPhone: String,
    profilePicture: String,
    driverLicense: String,
    yearsOfExperience: Number,
    unit: String,
    reg: String,
    hospital: String,
    hospitalId: String,
    department: String,
    resetOtp: String,
    resetOtpExpires: Date,
    emergencyContacts: [{
      id: String,
      name: String,
      relationship: String,
      phone: String,
      notifySms: Boolean
    }],
    medicalHistory: [{
      id: String,
      date: String,
      event: String,
      hospital: String,
      doctor: String,
      notes: String,
      type: { type: String }
    }],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
