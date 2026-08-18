const mongoose = require('mongoose')

const appointmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    department: { type: String, required: true, trim: true },
    message: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Appointment', appointmentSchema)
