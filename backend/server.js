require('dotenv').config()

const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const appointmentRoutes = require('./routes/appointments')
const homeRoutes = require('./routes/home')
const servicesRoutes = require('./routes/services')
const doctorRoutes = require('./routes/doctors')
const authRoutes = require('./routes/auth')

const app = express()
const PORT = process.env.PORT || 5000

connectDB()

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
}))
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Web Clinic API is running' })
})

app.use('/api/home', homeRoutes)
app.use('/api/services', servicesRoutes)
app.use('/api/doctors', doctorRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/auth', authRoutes)

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})
