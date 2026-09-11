const prisma = require('./prisma')
const Billing = require('../models/Billing')
const paymentService = require('./paymentService')

function nextInvoiceNo() {
  return `INV-${Date.now()}`
}

function totals(items, tax = 0) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.amount) * Number(item.quantity || 1), 0)
  return { subtotal, tax, total: subtotal + Number(tax || 0) }
}

async function listBills(query = {}, actor) {
  const where = {}
  if (query.patientId) where.patientId = query.patientId
  if (actor?.role === 'patient') {
    const Patient = require('../models/Patient')
    const patient = await Patient.findOne({ userId: actor._id })
    if (!patient) return []
    where.patientId = patient._id
  }
  return prisma.billing.findMany(where, { sort: { createdAt: -1 }, populate: 'patientId' })
}

async function createBill(data) {
  const { subtotal, tax, total } = totals(data.items, data.tax)
  return prisma.billing.create({
    invoiceNo: nextInvoiceNo(),
    patientId: data.patientId,
    appointmentId: data.appointmentId || null,
    items: data.items,
    subtotal,
    tax,
    total,
    notes: data.notes || '',
    status: 'unpaid',
  })
}

async function getBill(id) {
  const bill = await Billing.findById(id).populate('patientId')
  if (!bill) {
    const error = new Error('Invoice not found')
    error.status = 404
    throw error
  }
  return bill
}

async function updateBill(id, data) {
  if (data.items) Object.assign(data, totals(data.items, data.tax))
  const bill = await prisma.billing.update({ id }, data)
  if (!bill) {
    const error = new Error('Invoice not found')
    error.status = 404
    throw error
  }
  return bill
}

async function payBill(id, returnUrl) {
  const bill = await getBill(id)
  const payment = await paymentService.initiateForBilling(bill, returnUrl)
  return { bill, payment }
}

module.exports = { listBills, createBill, getBill, updateBill, payBill }
