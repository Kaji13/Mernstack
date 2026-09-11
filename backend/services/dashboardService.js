const Appointment = require('../models/Appointment')
const Patient = require('../models/Patient')
const Doctor = require('../models/Doctor')
const Billing = require('../models/Billing')
const Payment = require('../models/Payment')
const Department = require('../models/Department')
const MedicalRecord = require('../models/MedicalRecord')

const { isDbConnected } = require('../utils/homeData')

async function getStats(actor) {
  if (!isDbConnected()) {
    return {
      counts: {
        patients: 0,
        doctors: 0,
        departments: 0,
        appointments: 0,
        records: 0,
        invoices: 0,
        completedPayments: 0,
      },
      revenue: 0,
      upcoming: [],
      offline: true,
    }
  }
  const appointmentWhere = {}
  if (actor?.role === 'patient') appointmentWhere.email = actor.email
  if (actor?.role === 'doctor') {
    const profile = await Doctor.findOne({ userId: actor._id })
    if (profile) appointmentWhere.doctorSlug = profile.slug
  }

  const [patients, doctors, departments, appointments, records, invoices, payments, revenue] = await Promise.all([
    actor?.role === 'patient' ? Patient.countDocuments({ userId: actor._id }) : Patient.countDocuments(),
    Doctor.countDocuments(),
    Department.countDocuments(),
    Appointment.countDocuments(appointmentWhere),
    MedicalRecord.countDocuments(),
    Billing.countDocuments(),
    Payment.countDocuments({ status: 'completed' }),
    Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ])

  const upcoming = await Appointment.find({
    ...appointmentWhere,
    status: { $in: ['pending', 'confirmed'] },
    date: { $gte: new Date() },
  })
    .sort({ date: 1 })
    .limit(5)

  return {
    counts: {
      patients,
      doctors,
      departments,
      appointments,
      records,
      invoices,
      completedPayments: payments,
    },
    revenue: revenue[0]?.total || 0,
    upcoming,
  }
}

module.exports = { getStats }
