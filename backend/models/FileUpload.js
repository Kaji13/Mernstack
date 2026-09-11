const mongoose = require('mongoose')

const fileUploadSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', default: null },
    folder: { type: String, default: 'web-clinic' },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    provider: { type: String, enum: ['cloudinary', 'local'], default: 'local' },
    originalName: { type: String, default: '' },
    mimeType: { type: String, default: '' },
    size: { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model('FileUpload', fileUploadSchema)
