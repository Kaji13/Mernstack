const prisma = require('./prisma')
const Patient = require('../models/Patient')
const Appointment = require('../models/Appointment')
const Doctor = require('../models/Doctor')
const { uploadFile } = require('../utils/cloudinary')

function toPatient(doc) {
  if (!doc) return null
  const item = doc.toObject ? doc.toObject() : doc
  return { id: item._id.toString(), ...item }
}

async function doctorPatientFilter(actor) {
  const profile = await Doctor.findOne({ userId: actor._id })
  if (!profile) return { _id: { $in: [] } }
  const patientIds = await Appointment.distinct('patientId', {
    doctorSlug: profile.slug,
    patientId: { $ne: null },
  })
  return { _id: { $in: patientIds } }
}

async function assertPatientAccess(patient, actor) {
  if (actor.role === 'patient' && String(patient.userId) !== String(actor._id)) {
    const error = new Error('You do not have access to this resource')
    error.status = 403
    throw error
  }
  if (actor.role === 'doctor') {
    const allowed = await doctorPatientFilter(actor)
    if (!allowed._id.$in.some((id) => String(id) === String(patient._id))) {
      const error = new Error('You do not have access to this patient')
      error.status = 403
      throw error
    }
  }
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
  if (actor.role === 'doctor') Object.assign(where, await doctorPatientFilter(actor))
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
  await assertPatientAccess(patient, actor)
  return toPatient(patient)
}

async function updatePatient(id, data, actor) {
  const patient = await Patient.findById(id)
  if (!patient) {
    const error = new Error('Patient not found')
    error.status = 404
    throw error
  }
  await assertPatientAccess(patient, actor)
  const changes = { ...data }
  if (actor.role === 'patient') {
    const permitted = ['phone', 'address']
    Object.keys(changes).forEach((key) => {
      if (!permitted.includes(key)) delete changes[key]
    })
    if (!Object.keys(changes).length) {
      const error = new Error('Patients can only update their phone number and address')
      error.status = 403
      throw error
    }
  }
  if (changes.dateOfBirth !== undefined) changes.dateOfBirth = changes.dateOfBirth ? new Date(changes.dateOfBirth) : undefined
  Object.assign(patient, changes)
  await patient.save()
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

module.exports = { createPatient, listPatients, getPatient, updatePatient, addPatientFile }
