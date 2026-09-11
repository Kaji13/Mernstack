const mongoose = require('mongoose')

const billingItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    quantity: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
)

const billingSchema = new mongoose.Schema(
  {
    invoiceNo: { type: String, required: true, unique: true, trim: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
    items: [billingItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['draft', 'unpaid', 'paid', 'void'],
      default: 'unpaid',
    },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
)

billingSchema.index({ patientId: 1, createdAt: -1 })

module.exports = mongoose.model('Billing', billingSchema)
