const express = require('express')
const { authenticate, authorize } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const { initiatePaymentSchema, verifyPaymentSchema, verifyEsewaPaymentSchema } = require('../validators/clinical')
const paymentService = require('../services/paymentService')
const Appointment = require('../models/Appointment')
const Billing = require('../models/Billing')
const Payment = require('../models/Payment')

async function paymentAccess(actor, { appointment, billing }) {
  if (actor.role !== 'patient') return
  const Patient = require('../models/Patient')
  const patient = await Patient.findOne({ userId: actor._id }).lean()
  if (!patient || String(appointment?.patientId || billing?.patientId) !== String(patient._id)) {
    const error = new Error('You do not have access to this payment')
    error.status = 403
    throw error
  }
}

const router = express.Router()

router.post('/esewa/initiate', authenticate, validate(initiatePaymentSchema), async (req, res, next) => {
  try {
    const { appointmentId, billingId, returnUrl } = req.body
    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId)
      if (!appointment) return res.status(404).json({ message: 'Appointment not found' })
      await paymentAccess(req.user, { appointment })
      const payment = await paymentService.initiateEsewaForAppointment(appointment, returnUrl)
      return res.json({ payment, paymentUrl: payment.paymentUrl, formData: payment.raw.formData })
    }
    if (billingId) {
      const billing = await Billing.findById(billingId)
      if (!billing) return res.status(404).json({ message: 'Invoice not found' })
      await paymentAccess(req.user, { billing })
      const payment = await paymentService.initiateEsewaForBilling(billing, returnUrl)
      return res.json({ payment, paymentUrl: payment.paymentUrl, formData: payment.raw.formData })
    }
    return res.status(400).json({ message: 'appointmentId or billingId is required' })
  } catch (error) {
    next(error)
  }
})

router.post('/esewa/verify', validate(verifyEsewaPaymentSchema), async (req, res, next) => {
  try {
    const payment = await paymentService.verifyEsewaByTransactionUuid(req.body.transactionUuid)
    res.json({ message: payment.status === 'completed' ? 'Payment verified' : 'Payment not completed', payment })
  } catch (error) {
    next(error)
  }
})

router.get('/esewa/success', async (req, res, next) => {
  try {
    const encodedResponse = req.query.data
    if (!encodedResponse) return res.status(400).json({ message: 'Missing eSewa response data' })
    const response = JSON.parse(Buffer.from(encodedResponse, 'base64').toString('utf8'))
    const payment = await paymentService.verifyEsewaByTransactionUuid(response.transaction_uuid)
    const message = payment.status === 'completed' ? 'Payment verified' : 'Payment not completed'
    if (req.accepts('html')) {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
      return res.redirect(`${clientUrl}/payments/esewa/return?transaction_uuid=${encodeURIComponent(response.transaction_uuid)}`)
    }
    res.json({ message, payment })
  } catch (error) {
    next(error)
  }
})

router.get('/esewa/status', (_req, res) => {
  const configured = Boolean(process.env.ESEWA_SECRET_KEY && process.env.ESEWA_PRODUCT_CODE)
  res.json({
    configured,
    environment: process.env.ESEWA_ENVIRONMENT || 'uat',
    message: configured ? 'eSewa successfully integrated' : 'eSewa credentials are missing',
  })
})

router.get('/history', authenticate, async (req, res, next) => {
  try {
    const filter = {}
    if (req.query.status) filter.status = req.query.status
    if (req.query.provider) filter.provider = req.query.provider
    if (req.user.role === 'patient') {
      const Patient = require('../models/Patient')
      const patient = await Patient.findOne({ userId: req.user._id }).lean()
      filter.patientId = patient?._id || null
    }
    const payments = await Payment.find(filter).sort({ createdAt: -1 }).limit(500).lean()
    const summary = payments.reduce((result, payment) => {
      result.total += payment.amount
      result[payment.status] = (result[payment.status] || 0) + 1
      if (payment.status === 'completed') result.completedAmount += payment.amount
      return result
    }, { total: 0, completedAmount: 0, completed: 0, pending: 0, failed: 0, initiated: 0 })
    if (req.query.format === 'csv') {
      const csv = ['date,provider,status,amount,transactionId', ...payments.map((item) => [item.createdAt.toISOString(), item.provider, item.status, item.amount, item.transactionId || ''].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))].join('\n')
      res.type('text/csv').attachment('payments.csv').send(csv)
      return
    }
    res.json({ payments, summary })
  } catch (error) { next(error) }
})

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
