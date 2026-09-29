const prisma = require('./prisma')
const MedicalRecord = require('../models/MedicalRecord')

async function listRecords(query = {}, actor) {
  const where = {}
  if (query.patientId) where.patientId = query.patientId
  if (actor?.role === 'patient') {
    const Patient = require('../models/Patient')
    const patient = await Patient.findOne({ userId: actor._id })
    if (!patient) return []
    where.patientId = patient._id
  }
  if (actor?.role === 'doctor') {
    const Doctor = require('../models/Doctor')
    const doctor = await Doctor.findOne({ userId: actor._id }).lean()
    if (!doctor) return []
    where.doctorId = doctor._id
  }
  return prisma.medicalRecord.findMany(where, {
    sort: { createdAt: -1 },
    populate: ['patientId', 'doctorId', 'appointmentId'],
  })
}

async function createRecord(data, actor) {
  if (actor?.role === 'doctor') {
    const Doctor = require('../models/Doctor')
    const doctor = await Doctor.findOne({ userId: actor._id }).lean()
    if (!doctor) {
      const error = new Error('Doctor profile not found')
      error.status = 403
      throw error
    }
    const Appointment = require('../models/Appointment')
    const assigned = await Appointment.exists({ doctorSlug: doctor.slug, patientId: data.patientId })
    if (!assigned) {
      const error = new Error('You can only create records for patients assigned to you')
      error.status = 403
      throw error
    }
    data.doctorId = doctor._id
  }
  return prisma.medicalRecord.create(data)
}

async function assertRecordAccess(record, actor) {
  if (actor?.role === 'admin' || actor?.role === 'editor') return
  if (actor?.role === 'patient') {
    const Patient = require('../models/Patient')
    const patient = await Patient.findOne({ userId: actor._id }).select('_id').lean()
    if (patient && String(record.patientId?._id || record.patientId) === String(patient._id)) return
  }
  if (actor?.role === 'doctor') {
    const Doctor = require('../models/Doctor')
    const doctor = await Doctor.findOne({ userId: actor._id }).select('_id').lean()
    if (doctor && String(record.doctorId?._id || record.doctorId) === String(doctor._id)) return
  }
  const error = new Error('You do not have access to this medical record')
  error.status = 403
  throw error
}

async function getRecord(id, actor) {
  const record = await MedicalRecord.findById(id).populate(['patientId', 'doctorId', 'appointmentId'])
  if (!record) {
    const error = new Error('Medical record not found')
    error.status = 404
    throw error
  }
  await assertRecordAccess(record, actor)
  return record
}

async function updateRecord(id, data, actor) {
  const current = await MedicalRecord.findById(id)
  if (!current) {
    const error = new Error('Medical record not found')
    error.status = 404
    throw error
  }
  await assertRecordAccess(current, actor)
  if (data.patientId && String(data.patientId) !== String(current.patientId)) {
    const error = new Error('A medical record cannot be reassigned to another patient')
    error.status = 400
    throw error
  }
  delete data.doctorId
  const record = await prisma.medicalRecord.update({ id }, data)
  if (!record) {
    const error = new Error('Medical record not found')
    error.status = 404
    throw error
  }
  return record
}

async function removeRecord(id) {
  const record = await prisma.medicalRecord.delete({ id })
  if (!record) {
    const error = new Error('Medical record not found')
    error.status = 404
    throw error
  }
  return { message: 'Medical record removed' }
}

module.exports = { listRecords, createRecord, getRecord, updateRecord, removeRecord }
