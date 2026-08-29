const express = require('express')
const Appointment = require('../models/Appointment')
const { findDoctorBySlug, isSlotTaken } = require('../utils/doctorsData')
const { isValidSlot, parseDateKey } = require('../utils/slots')
const { isDbConnected } = require('../utils/homeData')
const memoryStore = require('../utils/memoryStore')

const router = express.Router()

router.get('/', async (_req, res, next) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 })
    res.json(appointments)
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
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
    } = req.body

    if (!name || !email || !phone || !date) {
      return res.status(400).json({
        message: 'Name, email, phone, and date are required',
      })
    }

    if (doctorSlug) {
      if (!timeSlot || !visitType) {
        return res.status(400).json({
          message: 'Time slot and visit type are required for doctor bookings',
        })
      }

      const doctor = await findDoctorBySlug(doctorSlug)
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' })
      }

      if (!isValidSlot(doctor, date, timeSlot)) {
        return res.status(400).json({
          message: 'That date or time is not on this doctor\'s schedule',
        })
      }

      if (await isSlotTaken(doctor.slug, date, timeSlot)) {
        return res.status(409).json({
          message: 'That slot was just taken. Please choose another time.',
        })
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
        timeSlot,
        visitType,
        source: 'doctor-slot',
        status: 'confirmed',
      }

      if (!isDbConnected()) {
        const appointment = memoryStore.addAppointment(payload)
        return res.status(201).json(appointment)
      }

      const appointment = await Appointment.create({
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        date: payload.date,
        department: payload.department,
        message: payload.message,
        doctorSlug: payload.doctorSlug,
        doctorName: payload.doctorName,
        timeSlot: payload.timeSlot,
        visitType: payload.visitType,
        source: 'doctor-slot',
        status: 'confirmed',
      })

      return res.status(201).json(appointment)
    }

    if (!department) {
      return res.status(400).json({
        message: 'Name, email, phone, date, and department are required',
      })
    }

    const appointment = await Appointment.create({
      name,
      email,
      phone,
      date,
      department,
      message,
      source: 'quick',
      status: 'pending',
    })

    res.status(201).json(appointment)
  } catch (error) {
    next(error)
  }
})

module.exports = router
