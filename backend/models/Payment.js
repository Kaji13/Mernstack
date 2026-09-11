const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema(
  {
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
    billingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Billing', default: null },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', default: null },
    provider: { type: String, enum: ['khalti', 'mock'], default: 'khalti' },
    pidx: { type: String, trim: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['initiated', 'pending', 'completed', 'failed'],
      default: 'initiated',
    },
    transactionId: { type: String, trim: true, default: '' },
    paymentUrl: { type: String, trim: true, default: '' },
    raw: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Payment', paymentSchema)
