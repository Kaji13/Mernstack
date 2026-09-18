require('dotenv').config()

const http = require('http')
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const connectDB = require('./config/db')
const appointmentRoutes = require('./routes/appointments')
const homeRoutes = require('./routes/home')
const servicesRoutes = require('./routes/services')
const doctorRoutes = require('./routes/doctors')
const authRoutes = require('./routes/auth')
const patientRoutes = require('./routes/patients')
const clinicDoctorRoutes = require('./routes/clinicDoctors')
const departmentRoutes = require('./routes/departments')
const medicalRecordRoutes = require('./routes/medicalRecords')
const billingRoutes = require('./routes/billing')
const paymentRoutes = require('./routes/payments')
const uploadRoutes = require('./routes/uploads')
const dashboardRoutes = require('./routes/dashboard')
const chatRoutes = require('./routes/chat')
const staffRoutes = require('./routes/staff')
const { attachSockets } = require('./sockets/chat')
const { uploadsDir } = require('./utils/cloudinary')
const { securityHeaders, sanitizeInput, rateLimit } = require('./middleware/security')

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 5000
const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173'

connectDB()

app.use(cors({
  origin: clientOrigin,
  credentials: true,
}))
app.disable('x-powered-by')
app.use(securityHeaders)
app.use(cookieParser())
app.use(express.json({ limit: '250kb' }))
app.use(sanitizeInput)
app.use('/api', rateLimit())
app.use('/api/auth', rateLimit({ windowMs: 15 * 60_000, max: 20 }))
app.use('/uploads', express.static(uploadsDir))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Web Clinic API is running' })
})

app.use('/api/home', homeRoutes)
app.use('/api/services', servicesRoutes)
app.use('/api/doctors', doctorRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/patients', patientRoutes)
app.use('/api/clinic/doctors', clinicDoctorRoutes)
app.use('/api/departments', departmentRoutes)
app.use('/api/medical-records', medicalRecordRoutes)
app.use('/api/billing', billingRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/uploads', uploadRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/staff', staffRoutes)

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  })
})

app.set('io', attachSockets(server, clientOrigin))

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})
