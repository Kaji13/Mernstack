const mongoose = require('mongoose')

const visitTypeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
  },
  { _id: false }
)

const doctorSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    initials: { type: String, required: true, trim: true },
    specialtyId: { type: String, required: true, trim: true },
    specialtyLabel: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    experience: { type: String, required: true, trim: true },
    patients: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    available: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    languages: [{ type: String, trim: true }],
    education: { type: String, required: true, trim: true },
    clinicDays: { type: String, required: true, trim: true },
    consultation: { type: String, required: true, trim: true },
    accent: { type: String, required: true, trim: true },
    bio: { type: String, required: true, trim: true },
    focusAreas: [{ type: String, trim: true }],
    workDays: [{ type: Number, min: 0, max: 6 }],
    slotTimes: [{ type: String, trim: true }],
    visitTypes: [visitTypeSchema],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Doctor', doctorSchema)
