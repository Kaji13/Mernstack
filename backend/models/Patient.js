const mongoose = require('mongoose')

const fileSchema = new mongoose.Schema(
  {
    url: String,
    publicId: String,
    provider: { type: String, enum: ['cloudinary', 'local'], default: 'local' },
    originalName: String,
    mimeType: String,
    size: Number,
    label: { type: String, default: '' },
  },
  { _id: true, timestamps: true }
)

const patientSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other', ''], default: '' },
    address: { type: String, trim: true, default: '' },
    bloodGroup: { type: String, trim: true, default: '' },
    notes: { type: String, trim: true, default: '' },
    files: [fileSchema],
  },
  { timestamps: true }
)

patientSchema.index({ email: 1 })
patientSchema.index({ userId: 1 })

module.exports = mongoose.model('Patient', patientSchema)
