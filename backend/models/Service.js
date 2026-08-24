const mongoose = require('mongoose')

const serviceSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    icon: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['specialty', 'diagnostic', 'preventive'],
    },
    description: { type: String, required: true, trim: true },
    longDescription: { type: String, required: true, trim: true },
    features: [{ type: String, trim: true }],
    duration: { type: String, required: true, trim: true },
    availability: { type: String, required: true, trim: true },
    popular: { type: Boolean, default: false },
    accent: { type: String, required: true, trim: true },
    featuredOnHome: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Service', serviceSchema)
