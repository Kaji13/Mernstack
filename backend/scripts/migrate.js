require('dotenv').config()

const mongoose = require('mongoose')
const Department = require('../models/Department')
const User = require('../models/User')
const RefreshToken = require('../models/RefreshToken')
const Otp = require('../models/Otp')
const Patient = require('../models/Patient')
const Doctor = require('../models/Doctor')
const Appointment = require('../models/Appointment')
const MedicalRecord = require('../models/MedicalRecord')
const Billing = require('../models/Billing')
const Payment = require('../models/Payment')
const ChatMessage = require('../models/ChatMessage')
const FileUpload = require('../models/FileUpload')

const models = [
  User,
  RefreshToken,
  Otp,
  Patient,
  Doctor,
  Department,
  Appointment,
  MedicalRecord,
  Billing,
  Payment,
  ChatMessage,
  FileUpload,
]

const defaultDepartments = [
  { name: 'Cardiology', slug: 'cardiology', description: 'Heart and vascular care' },
  { name: 'Neurology', slug: 'neurology', description: 'Brain and nervous system' },
  { name: 'Orthopedics', slug: 'orthopedics', description: 'Bones and joints' },
  { name: 'Pediatrics', slug: 'pediatrics', description: 'Child health' },
  { name: 'Dermatology', slug: 'dermatology', description: 'Skin care' },
  { name: 'General Medicine', slug: 'general-medicine', description: 'Primary care' },
]

async function migrate() {
  const uri = process.env.MONGO_URI
  if (!uri) {
    throw new Error('MONGO_URI is required to run migrations')
  }

  await mongoose.connect(uri)
  console.log('Connected. Syncing indexes...')

  for (const model of models) {
    await model.syncIndexes()
    console.log(`Synced ${model.modelName}`)
  }

  for (const dept of defaultDepartments) {
    await Department.updateOne({ slug: dept.slug }, { $setOnInsert: dept }, { upsert: true })
  }
  console.log('Seeded default departments')

  await mongoose.disconnect()
  console.log('Migration complete')
}

migrate().catch((error) => {
  console.error(error)
  process.exit(1)
})
