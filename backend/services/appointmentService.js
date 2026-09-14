const Appointment = require('../models/Appointment')
const Patient = require('../models/Patient')
const { findDoctorBySlug, isSlotTaken } = require('../utils/doctorsData')
const { isValidSlot, parseDateKey } = require('../utils/slots')
const { isDbConnected } = require('../utils/homeData')
const memoryStore = require('../utils/memoryStore')
const paymentService = require('./paymentService')

async function ensurePatient({ name, email, phone, patientId, actor }) {
  if (patientId) {
    const found = await Patient.findById(patientId)
    if (!found) {
      const error = new Error('Patient not found')
      error.status = 404
      throw error
    }
    return found
  }
  if (!isDbConnected()) return null

  const existing = await Patient.findOne({ email: String(email).toLowerCase() })
  if (existing) return existing

  return Patient.create({
    userId: actor?.role === 'patient' ? actor._id : null,
    fullName: name,
    email,
    phone,
  })
}

async function createAppointment(body, actor) {
  const {
    name,
    email,
    phone,
    date,
    department,
    message,
    doctorSlug,
    timeSlot,
    visitType,
    paymentProvider,
    patientId,
  } = body

  if (doctorSlug) {
    if (!timeSlot || !visitType) {
      const error = new Error('Time slot and visit type are required for doctor bookings')
      error.status = 400
      throw error
    }

    const doctor = await findDoctorBySlug(doctorSlug)
    if (!doctor) {
      const error = new Error('Doctor not found')
      error.status = 404
      throw error
    }

    if (!isValidSlot(doctor, date, timeSlot)) {
      const error = new Error('That date or time is not on this doctor\'s schedule')
      error.status = 400
      throw error
    }

    if (await isSlotTaken(doctor.slug, date, timeSlot)) {
      const error = new Error('That slot was just taken. Please choose another time.')
      error.status = 409
      throw error
    }

    const amount = Number(doctor.consultationFee || 0)
    if (amount > 0) {
      if (!isDbConnected()) {
        const error = new Error('Online payments are temporarily unavailable. The appointment was not booked.')
        error.status = 503
        throw error
      }
      paymentService.assertProviderConfigured(paymentProvider || 'khalti')
    }
    const payload = {
      name,
      email,
      phone,
      date: parseDateKey(date),
      dateKey: date,
      department: doctor.specialtyLabel,
      message: message || '',
      doctorSlug: doctor.slug,
      doctorName: doctor.name,
      doctorId: doctor._id || doctor.id || null,
      timeSlot,
      visitType,
      source: 'doctor-slot',
      // A time slot is held as soon as the request is created. Staff confirm it
      // only after payment (when required) and their availability check.
      status: 'pending',
      amount,
      paymentStatus: amount > 0 ? 'pending' : 'unpaid',
    }

    if (!isDbConnected()) {
      return { appointment: memoryStore.addAppointment(payload), payment: null }
    }

    const patient = await ensurePatient({ name, email, phone, patientId, actor })
    const appointment = await Appointment.create({
      ...payload,
      patientId: patient?._id || null,
    })

    let payment = null
    if (amount > 0) {
      payment = paymentProvider === 'esewa'
        ? await paymentService.initiateEsewaForAppointment(appointment)
        : await paymentService.initiateForAppointment(appointment)
    }

    return { appointment, payment }
  }

  if (!department) {
    const error = new Error('Name, email, phone, date, and department are required')
    error.status = 400
    throw error
  }

  if (!isDbConnected()) {
    const appointment = memoryStore.addAppointment({
      name,
      email,
      phone,
      date,
      department,
      message: message || '',
      source: 'quick',
      status: 'pending',
    })
    return { appointment, payment: null }
  }

  const patient = await ensurePatient({ name, email, phone, patientId, actor })
  const appointment = await Appointment.create({
    name,
    email,
    phone,
    date,
    department,
    message,
    source: 'quick',
    status: 'pending',
    patientId: patient?._id || null,
  })

  return { appointment, payment: null }
}

async function listAppointments(actor) {
  const where = {}
  if (actor?.role === 'patient') where.email = actor.email
  if (actor?.role === 'doctor') {
    const Doctor = require('../models/Doctor')
    const profile = await Doctor.findOne({ userId: actor._id })
    if (profile) where.doctorSlug = profile.slug
  }
  return Appointment.find(where).sort({ createdAt: -1 })
}

async function updateAppointmentStatus(id, status, actor) {
  const appointment = await Appointment.findById(id)
  if (!appointment) {
    const error = new Error('Appointment not found')
    error.status = 404
    throw error
  }

  if (actor?.role === 'doctor') {
    const Doctor = require('../models/Doctor')
    const profile = await Doctor.findOne({ userId: actor._id })
    if (!profile || appointment.doctorSlug !== profile.slug) {
      const error = new Error('You can only update appointments assigned to you')
      error.status = 403
      throw error
    }
  }

  appointment.status = status
  await appointment.save()
  return appointment
}

module.exports = { createAppointment, listAppointments, updateAppointmentStatus }
