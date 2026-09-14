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

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]))
}

async function getInvoice(id, actor) {
  const bill = await getBill(id)
  if (actor?.role === 'patient' && String(bill.patientId?.userId) !== String(actor._id)) {
    const error = new Error('You do not have access to this invoice')
    error.status = 403
    throw error
  }
  const Payment = require('../models/Payment')
  const payments = await Payment.find({ billingId: bill._id }).sort({ createdAt: -1 }).lean()
  return { bill, payments }
}

function renderInvoice({ bill, payments }) {
  const rows = bill.items.map((item) => `<tr><td>${escapeHtml(item.description)}</td><td>${item.quantity}</td><td>Rs ${Number(item.amount).toFixed(2)}</td><td>Rs ${(Number(item.amount) * Number(item.quantity)).toFixed(2)}</td></tr>`).join('')
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(bill.invoiceNo)}</title><style>body{font:14px Arial;color:#173b39;margin:40px}table{width:100%;border-collapse:collapse}th,td{padding:10px;border-bottom:1px solid #d7e3e1;text-align:left}.total{text-align:right;font-size:16px;margin-top:20px}</style></head><body><h1>Web Clinic</h1><h2>Invoice ${escapeHtml(bill.invoiceNo)}</h2><p><b>Patient:</b> ${escapeHtml(bill.patientId?.fullName)}<br><b>Status:</b> ${escapeHtml(bill.status)}</p><table><thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table><p class="total">Subtotal: Rs ${bill.subtotal.toFixed(2)}<br>Tax: Rs ${bill.tax.toFixed(2)}<br><b>Grand total: Rs ${bill.total.toFixed(2)}</b></p>${bill.notes ? `<p>Notes: ${escapeHtml(bill.notes)}</p>` : ''}<p>Payments recorded: ${payments.length}</p></body></html>`
}

module.exports = { listBills, createBill, getBill, updateBill, payBill, getInvoice, renderInvoice }
