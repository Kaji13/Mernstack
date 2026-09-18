require('dotenv').config()

const mongoose = require('mongoose')
const connectDB = require('../config/db')
const User = require('../models/User')

async function createAdmin() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, MONGO_URI } = process.env
  if (!MONGO_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('MONGO_URI, ADMIN_EMAIL, and ADMIN_PASSWORD must be set')
  }
  if (ADMIN_PASSWORD.length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters')
  }

  await connectDB()
  const email = ADMIN_EMAIL.toLowerCase()
  const existing = await User.findOne({ email })
  if (existing) {
    throw new Error('An account with that email already exists')
  }
  await User.create({
    name: ADMIN_NAME || 'Clinic Administrator',
    email,
    password: ADMIN_PASSWORD,
    role: 'admin',
    isVerified: true,
    isActive: true,
  })
  console.log(`Admin account created for ${email}`)
  await mongoose.disconnect()
}

createAdmin().catch(async (error) => {
  console.error(`Unable to create admin: ${error.message}`)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})
