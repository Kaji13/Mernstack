const Payment = require('../models/Payment')
const Appointment = require('../models/Appointment')
const Billing = require('../models/Billing')
const khalti = require('../config/khalti')

function rupeesToPaisa(amount) {
  return Math.round(Number(amount) * 100)
}

async function initiateForAppointment(appointment, returnUrl) {
  const amount = Number(appointment.amount || 0)
  if (amount <= 0) {
    const error = new Error('No payable amount on this appointment')
    error.status = 400
    throw error
  }

  const websiteUrl = process.env.CLIENT_URL || 'http://localhost:5173'
  const finalReturnUrl = returnUrl || `${websiteUrl}/payments/khalti/return`

  if (!khalti.isConfigured()) {
    const payment = await Payment.create({
      appointmentId: appointment._id,
      patientId: appointment.patientId,
      provider: 'mock',
      pidx: `mock-${appointment._id}`,
      amount,
      status: 'pending',
      paymentUrl: `${websiteUrl}/payments/mock?pidx=mock-${appointment._id}`,
      raw: { mode: 'khalti-not-configured' },
    })
    return payment
  }

  const initiated = await khalti.initiateEpayment({
    return_url: finalReturnUrl,
    website_url: websiteUrl,
    amount: rupeesToPaisa(amount),
    purchase_order_id: String(appointment._id),
    purchase_order_name: `Appointment with ${appointment.doctorName || 'Web Clinic'}`,
    customer_info: {
      name: appointment.name,
      email: appointment.email,
      phone: appointment.phone,
    },
  })

  const payment = await Payment.create({
    appointmentId: appointment._id,
    patientId: appointment.patientId,
    provider: 'khalti',
    pidx: initiated.pidx,
    amount,
    status: 'pending',
    paymentUrl: initiated.payment_url,
    raw: initiated,
  })

  appointment.paymentStatus = 'pending'
  await appointment.save()
  return payment
}

async function initiateForBilling(billing, returnUrl) {
  const websiteUrl = process.env.CLIENT_URL || 'http://localhost:5173'
  const finalReturnUrl = returnUrl || `${websiteUrl}/payments/khalti/return`

  if (!khalti.isConfigured()) {
    return Payment.create({
      billingId: billing._id,
      patientId: billing.patientId,
      provider: 'mock',
      pidx: `mock-bill-${billing._id}`,
      amount: billing.total,
      status: 'pending',
      paymentUrl: `${websiteUrl}/payments/mock?pidx=mock-bill-${billing._id}`,
      raw: { mode: 'khalti-not-configured' },
    })
  }

  const initiated = await khalti.initiateEpayment({
    return_url: finalReturnUrl,
    website_url: websiteUrl,
    amount: rupeesToPaisa(billing.total),
    purchase_order_id: billing.invoiceNo,
    purchase_order_name: `Invoice ${billing.invoiceNo}`,
  })

  return Payment.create({
    billingId: billing._id,
    patientId: billing.patientId,
    provider: 'khalti',
    pidx: initiated.pidx,
    amount: billing.total,
    status: 'pending',
    paymentUrl: initiated.payment_url,
    raw: initiated,
  })
}

async function verifyByPidx(pidx) {
  const payment = await Payment.findOne({ pidx })
  if (!payment) {
    const error = new Error('Payment not found')
    error.status = 404
    throw error
  }

  if (payment.provider === 'mock' || !khalti.isConfigured()) {
    payment.status = 'completed'
    payment.transactionId = `mock-txn-${Date.now()}`
    await payment.save()
    await markPaid(payment)
    return payment
  }

  const lookup = await khalti.lookupEpayment(pidx)
  payment.raw = { ...payment.raw, lookup }
  payment.transactionId = lookup.transaction_id || lookup.txnId || payment.transactionId

  if (lookup.status === 'Completed') {
    payment.status = 'completed'
    await payment.save()
    await markPaid(payment)
  } else if (lookup.status === 'Pending' || lookup.status === 'Initiated') {
    payment.status = 'pending'
    await payment.save()
  } else {
    payment.status = 'failed'
    await payment.save()
    if (payment.appointmentId) {
      await Appointment.findByIdAndUpdate(payment.appointmentId, { paymentStatus: 'failed' })
    }
  }

  return payment
}

async function markPaid(payment) {
  if (payment.appointmentId) {
    await Appointment.findByIdAndUpdate(payment.appointmentId, {
      paymentStatus: 'paid',
    })
  }
  if (payment.billingId) {
    await Billing.findByIdAndUpdate(payment.billingId, { status: 'paid' })
  }
}

module.exports = { initiateForAppointment, initiateForBilling, verifyByPidx }
