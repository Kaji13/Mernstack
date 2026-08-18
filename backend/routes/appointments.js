const express = require('express')
const Appointment = require('../models/Appointment')

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
    const { name, email, phone, date, department, message } = req.body

    if (!name || !email || !phone || !date || !department) {
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
    })

    res.status(201).json(appointment)
  } catch (error) {
    next(error)
  }
})

module.exports = router
