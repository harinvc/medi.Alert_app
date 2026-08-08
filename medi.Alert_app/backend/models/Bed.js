const mongoose = require('mongoose');

const bedSchema = mongoose.Schema(
  {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    status: { type: String, required: true },
    patient: { type: String, default: null },
    type: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Bed = mongoose.model('Bed', bedSchema);

module.exports = Bed;
