const prisma = require('./prisma')
const Doctor = require('../models/Doctor')

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function initialsFrom(name) {
  return String(name)
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase()
}

async function listDoctors(query = {}) {
  const where = {}
  if (query.available === 'true') where.available = true
  if (query.available === 'false') where.available = false
  if (query.departmentId) where.departmentId = query.departmentId
  const doctors = await prisma.doctor.findMany(where, { sort: { order: 1, name: 1 }, populate: 'departmentId' })
  return doctors
}

async function getDoctor(id) {
  const doctor = await prisma.doctor.findUnique({ id })
  if (!doctor) {
    const error = new Error('Doctor not found')
    error.status = 404
    throw error
  }
  return doctor
}

async function getDoctorForUser(userId) {
  return prisma.doctor.findUnique({ userId })
}

async function createDoctor(data) {
  const slug = data.slug || slugify(data.name)
  const existing = await Doctor.findOne({ slug })
  if (existing) {
    const error = new Error('A doctor with that slug already exists')
    error.status = 409
    throw error
  }
  if (data.userId) {
    const existingProfile = await Doctor.findOne({ userId: data.userId })
    if (existingProfile) {
      const error = new Error('This doctor account already has a profile')
      error.status = 409
      throw error
    }
  }
  return prisma.doctor.create({
    ...data,
    slug,
    initials: data.initials || initialsFrom(data.name),
    visitTypes: data.visitTypes || [
      { id: 'consult', label: 'Consultation' },
      { id: 'follow-up', label: 'Follow-up' },
    ],
    workDays: data.workDays || [0, 1, 2, 3, 4],
    slotTimes: data.slotTimes || ['09:00', '10:00', '11:00', '14:00', '15:00'],
  })
}

async function updateDoctor(id, data) {
  const doctor = await prisma.doctor.update({ id }, data)
  if (!doctor) {
    const error = new Error('Doctor not found')
    error.status = 404
    throw error
  }
  return doctor
}

async function removeDoctor(id) {
  const doctor = await prisma.doctor.delete({ id })
  if (!doctor) {
    const error = new Error('Doctor not found')
    error.status = 404
    throw error
  }
  return { message: 'Doctor removed' }
}

module.exports = { listDoctors, getDoctor, getDoctorForUser, createDoctor, updateDoctor, removeDoctor }
