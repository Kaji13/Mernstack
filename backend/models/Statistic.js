const mongoose = require('mongoose')

const statisticSchema = new mongoose.Schema(
  {
    value: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Statistic', statisticSchema)
