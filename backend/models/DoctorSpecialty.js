const mongoose = require('mongoose')

const doctorSpecialtySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    label: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model('DoctorSpecialty', doctorSpecialtySchema)
