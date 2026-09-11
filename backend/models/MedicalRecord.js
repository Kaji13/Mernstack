const mongoose = require('mongoose')

const medicalRecordSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', default: null },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
    diagnosis: { type: String, required: true, trim: true },
    notes: { type: String, trim: true, default: '' },
    prescriptions: [{ type: String, trim: true }],
    attachments: [{
      url: String,
      publicId: String,
      provider: { type: String, enum: ['cloudinary', 'local'], default: 'local' },
      originalName: String,
    }],
  },
  { timestamps: true }
)

medicalRecordSchema.index({ patientId: 1, createdAt: -1 })

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema)
