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
  return prisma.medicalRecord.findMany(where, {
    sort: { createdAt: -1 },
    populate: ['patientId', 'doctorId', 'appointmentId'],
  })
}

async function createRecord(data) {
  return prisma.medicalRecord.create(data)
}

async function getRecord(id) {
  const record = await MedicalRecord.findById(id).populate(['patientId', 'doctorId', 'appointmentId'])
  if (!record) {
    const error = new Error('Medical record not found')
    error.status = 404
    throw error
  }
  return record
}

async function updateRecord(id, data) {
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
