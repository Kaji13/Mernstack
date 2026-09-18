const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, trim: true, default: '' },
    role: {
      type: String,
      enum: ['admin', 'editor', 'doctor', 'patient'],
      default: 'patient',
    },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    passwordChangedAt: { type: Date },
  },
  { timestamps: true }
)

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const bcrypt = require('bcryptjs')
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  this.passwordChangedAt = new Date()
  next()
})

userSchema.methods.comparePassword = function (candidate) {
  const bcrypt = require('bcryptjs')
  return bcrypt.compare(candidate, this.password)
}

module.exports = mongoose.model('User', userSchema)
