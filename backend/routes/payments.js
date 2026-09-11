const express = require('express')
const { authenticate } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const { initiatePaymentSchema, verifyPaymentSchema } = require('../validators/clinical')
const paymentService = require('../services/paymentService')
const Appointment = require('../models/Appointment')
const Billing = require('../models/Billing')

const router = express.Router()

router.post('/khalti/initiate', authenticate, validate(initiatePaymentSchema), async (req, res, next) => {
  try {
    const { appointmentId, billingId, returnUrl } = req.body
    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId)
      if (!appointment) return res.status(404).json({ message: 'Appointment not found' })
      const payment = await paymentService.initiateForAppointment(appointment, returnUrl)
      return res.json({ payment, khaltiConfigured: Boolean(process.env.KHALTI_SECRET_KEY) })
    }
    if (billingId) {
      const billing = await Billing.findById(billingId)
      if (!billing) return res.status(404).json({ message: 'Invoice not found' })
      const payment = await paymentService.initiateForBilling(billing, returnUrl)
      return res.json({ payment, khaltiConfigured: Boolean(process.env.KHALTI_SECRET_KEY) })
    }
    return res.status(400).json({ message: 'appointmentId or billingId is required' })
  } catch (error) {
    next(error)
  }
})

router.post('/khalti/verify', validate(verifyPaymentSchema), async (req, res, next) => {
  try {
    const payment = await paymentService.verifyByPidx(req.body.pidx)
    res.json({
      message: payment.status === 'completed' ? 'Payment verified' : 'Payment not completed',
      payment,
    })
  } catch (error) {
    next(error)
  }
})

router.get('/khalti/status', (_req, res) => {
  res.json({
    configured: Boolean(process.env.KHALTI_SECRET_KEY),
    baseUrl: process.env.KHALTI_BASE_URL || 'https://dev.khalti.com/api/v2',
    message: process.env.KHALTI_SECRET_KEY
      ? 'Khalti successfully integrated'
      : 'Khalti keys missing; mock payments are enabled',
  })
})

module.exports = router
