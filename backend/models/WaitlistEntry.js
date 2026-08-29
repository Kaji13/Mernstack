const mongoose = require('mongoose')

const waitlistEntrySchema = new mongoose.Schema(
  {
    doctorSlug: { type: String, required: true, trim: true, lowercase: true, index: true },
    doctorName: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    preferredDays: { type: String, trim: true, default: '' },
    note: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['open', 'notified', 'booked'], default: 'open' },
  },
  { timestamps: true }
)

waitlistEntrySchema.index({ doctorSlug: 1, email: 1 }, { unique: true })

module.exports = mongoose.model('WaitlistEntry', waitlistEntrySchema)
