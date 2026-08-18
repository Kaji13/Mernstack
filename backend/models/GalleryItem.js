const mongoose = require('mongoose')

const galleryItemSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    gradient: { type: String, required: true },
    icon: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model('GalleryItem', galleryItemSchema)
