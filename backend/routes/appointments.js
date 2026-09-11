const express = require('express')
const { optionalAuth, authenticate, authorize } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const { createAppointmentSchema, appointmentStatusSchema } = require('../validators/clinical')
const appointmentService = require('../services/appointmentService')

const router = express.Router()

router.get('/', authenticate, async (req, res, next) => {
  try {
    const appointments = await appointmentService.listAppointments(req.user)
    res.json(appointments)
  } catch (error) {
    next(error)
  }
})

router.post('/', optionalAuth, validate(createAppointmentSchema), async (req, res, next) => {
  try {
    const result = await appointmentService.createAppointment(req.body, req.user)
    const appointment = result.appointment
    const payload = appointment.toObject ? appointment.toObject() : appointment
    res.status(201).json({ ...payload, payment: result.payment || null })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'That slot was just reserved. Please choose another available time.',
      })
    }
    next(error)
  }
})

router.patch(
  '/:id/status',
  authenticate,
  authorize('admin', 'editor', 'doctor'),
  validate(appointmentStatusSchema),
  async (req, res, next) => {
    try {
      const appointment = await appointmentService.updateAppointmentStatus(
        req.params.id,
        req.body.status,
        req.user
      )
      res.json(appointment)
    } catch (error) {
      next(error)
    }
  }
)

module.exports = router
