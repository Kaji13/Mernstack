const Payment = require('../models/Payment')
const Appointment = require('../models/Appointment')
const Billing = require('../models/Billing')
const khalti = require('../config/khalti')
const esewa = require('../config/esewa')

function rupeesToPaisa(amount) {
  return Math.round(Number(amount) * 100)
}

function assertProviderConfigured(provider) {
  if (provider === 'esewa' && !esewa.isConfigured()) {
    const error = new Error('eSewa is not configured. Set ESEWA_SECRET_KEY and ESEWA_PRODUCT_CODE before accepting payments.')
    error.status = 503
    throw error
  }
  if (provider === 'khalti' && !khalti.isConfigured()) {
    const error = new Error('Khalti is not configured. Set KHALTI_SECRET_KEY before accepting payments.')
    error.status = 503
    throw error
  }
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

  assertProviderConfigured('khalti')

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

  assertProviderConfigured('khalti')

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

function createEsewaTransactionId() {
  return `ESEWA-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`.toUpperCase()
}

async function initiateEsewaForAppointment(appointment, returnUrl) {
  const amount = Number(appointment.amount || 0)
  if (amount <= 0) {
    const error = new Error('No payable amount on this appointment')
    error.status = 400
    throw error
  }
  return initiateEsewa({ appointmentId: appointment._id, patientId: appointment.patientId, amount }, returnUrl, appointment)
}

async function initiateEsewaForBilling(billing, returnUrl) {
  const amount = Number(billing.total || 0)
  if (amount <= 0) {
    const error = new Error('No payable amount on this invoice')
    error.status = 400
    throw error
  }
  return initiateEsewa({ billingId: billing._id, patientId: billing.patientId, amount }, returnUrl)
}

async function initiateEsewa(reference, returnUrl, appointment) {
  assertProviderConfigured('esewa')

  const websiteUrl = process.env.CLIENT_URL || 'http://localhost:5173'
  const apiUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`
  const transactionUuid = createEsewaTransactionId()
  const successUrl = process.env.ESEWA_SUCCESS_URL || `${apiUrl}/api/payments/esewa/success`
  const failureUrl = process.env.ESEWA_FAILURE_URL || returnUrl || `${websiteUrl}/payments/esewa/return`
  const formData = esewa.buildPaymentForm({
    amount: reference.amount,
    transactionUuid,
    successUrl,
    failureUrl,
  })
  const payment = await Payment.create({
    ...reference,
    provider: 'esewa',
    pidx: transactionUuid,
    amount: reference.amount,
    status: 'pending',
    paymentUrl: esewa.getFormUrl(),
    raw: { formData },
  })
  if (appointment) {
    appointment.paymentStatus = 'pending'
    await appointment.save()
  }
  return payment
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

async function verifyEsewaByTransactionUuid(transactionUuid) {
  const payment = await Payment.findOne({ provider: 'esewa', pidx: transactionUuid })
  if (!payment) {
    const error = new Error('eSewa payment not found')
    error.status = 404
    throw error
  }
  if (!esewa.isConfigured()) {
    const error = new Error('eSewa is not configured')
    error.status = 503
    throw error
  }

  const lookup = await esewa.lookupPayment({ amount: payment.amount, transactionUuid })
  payment.raw = { ...payment.raw, lookup }
  payment.transactionId = lookup.ref_id || lookup.refId || payment.transactionId
  if (lookup.status === 'COMPLETE') {
    payment.status = 'completed'
    await payment.save()
    await markPaid(payment)
  } else if (lookup.status === 'PENDING' || lookup.status === 'AMBIGUOUS') {
    payment.status = 'pending'
    await payment.save()
  } else {
    payment.status = 'failed'
    await payment.save()
    if (payment.appointmentId) await Appointment.findByIdAndUpdate(payment.appointmentId, { paymentStatus: 'failed' })
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

module.exports = {
  initiateForAppointment,
  initiateForBilling,
  initiateEsewaForAppointment,
  initiateEsewaForBilling,
  verifyByPidx,
  verifyEsewaByTransactionUuid,
  assertProviderConfigured,
}
