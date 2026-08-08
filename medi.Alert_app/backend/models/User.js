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
    unit: String,
    reg: String,
    hospital: String,
    department: String,
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
