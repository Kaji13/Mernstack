const mongoose = require('mongoose')

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    specialty: { type: String, required: true, trim: true },
    experience: { type: String, required: true, trim: true },
    initials: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    available: { type: Boolean, default: true },
    featured: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Doctor', doctorSchema)
