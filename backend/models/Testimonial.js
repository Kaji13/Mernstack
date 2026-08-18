const mongoose = require('mongoose')

const testimonialSchema = new mongoose.Schema(
  {
    quote: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    initials: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Testimonial', testimonialSchema)
