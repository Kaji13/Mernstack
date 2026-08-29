const mongoose = require('mongoose')

const doctorVisitStepSchema = new mongoose.Schema(
  {
    step: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model('DoctorVisitStep', doctorVisitStepSchema)
