const prisma = require('./prisma')
const Patient = require('../models/Patient')
const { uploadFile } = require('../utils/cloudinary')

function toPatient(doc) {
  if (!doc) return null
  const item = doc.toObject ? doc.toObject() : doc
  return { id: item._id.toString(), ...item }
}

async function createPatient(data, actor) {
  if (actor?.role === 'patient') {
    data.userId = actor._id
    data.fullName = data.fullName || actor.name
    data.email = data.email || actor.email
  }

  const existing = await Patient.findOne({
    email: String(data.email).toLowerCase(),
    ...(data.userId ? { userId: data.userId } : {}),
  })
  if (existing && String(existing.email) === String(data.email).toLowerCase() && data.userId && String(existing.userId) === String(data.userId)) {
    return toPatient(existing)
  }

  const patient = await prisma.patient.create({
    ...data,
    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
  })
  return toPatient(patient)
}

async function listPatients(actor, query = {}) {
  const where = {}
  if (actor.role === 'patient') where.userId = actor._id
  if (query.q) {
    where.$or = [
      { fullName: new RegExp(query.q, 'i') },
      { email: new RegExp(query.q, 'i') },
      { phone: new RegExp(query.q, 'i') },
    ]
  }
  const patients = await prisma.patient.findMany(where, { sort: { createdAt: -1 } })
  return patients.map(toPatient)
}

async function getPatient(id, actor) {
  const patient = await prisma.patient.findUnique({ id })
  if (!patient) {
    const error = new Error('Patient not found')
    error.status = 404
    throw error
  }
  if (actor.role === 'patient' && String(patient.userId) !== String(actor._id)) {
    const error = new Error('You do not have access to this resource')
    error.status = 403
    throw error
  }
  return toPatient(patient)
}

async function addPatientFile(id, file, actor, label = '') {
  const patient = await getPatient(id, actor)
  const uploaded = await uploadFile(file, 'web-clinic/patients')
  const updated = await Patient.findByIdAndUpdate(
    patient.id,
    { $push: { files: { ...uploaded, label } } },
    { new: true }
  )
  return toPatient(updated)
}

module.exports = { createPatient, listPatients, getPatient, addPatientFile }
