const mongoose = require('mongoose');

const medicationOrderSchema = mongoose.Schema(
  {
    id: { type: String, required: true },
    doctorName: { type: String, required: true },
    medication: { type: String, required: true },
    dosage: { type: String, required: true },
    timestamp: { type: String, required: true },
    status: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const MedicationOrder = mongoose.model('MedicationOrder', medicationOrderSchema);

module.exports = MedicationOrder;
