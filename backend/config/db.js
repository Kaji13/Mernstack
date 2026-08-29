const mongoose = require('mongoose')

const connectDB = async () => {
  const uri = process.env.MONGO_URI

  if (!uri) {
    console.warn('MONGO_URI is not set. Database connection skipped.')
    return
  }

  try {
    await mongoose.connect(uri)
    console.log('MongoDB connected')
  } catch (error) {
    console.error('MongoDB connection failed:', error.message)
    console.warn('API will keep running with seed data until MongoDB is available.')
  }
}

module.exports = connectDB
