const mongoose = require('mongoose')

const clinicInfoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    tagline: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    hero: {
      title: String,
      subtitle: String,
      badge: String,
      rating: Number,
      reviewCount: Number,
      isOpen: Boolean,
      openHours: String,
    },
    hours: [{ day: String, time: String }],
    departments: [{ value: String, label: String }],
  },
  { timestamps: true }
)

module.exports = mongoose.model('ClinicInfo', clinicInfoSchema)
