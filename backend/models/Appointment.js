const mongoose = require('mongoose')

const appointmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    department: { type: String, required: true, trim: true },
    message: { type: String, trim: true, default: '' },
    doctorSlug: { type: String, trim: true, lowercase: true, default: '' },
    doctorName: { type: String, trim: true, default: '' },
    timeSlot: { type: String, trim: true, default: '' },
    visitType: { type: String, trim: true, default: '' },
    source: { type: String, enum: ['quick', 'doctor-slot'], default: 'quick' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
)

appointmentSchema.index({ doctorSlug: 1, date: 1, timeSlot: 1 })

module.exports = mongoose.model('Appointment', appointmentSchema)
