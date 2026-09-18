const prisma = require('./prisma')
const Department = require('../models/Department')

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function listDepartments(query = {}) {
  const where = {}
  if (query.active === 'true') where.isActive = true
  return prisma.department.findMany(where, { sort: { name: 1 } })
}

async function createDepartment(data) {
  const slug = data.slug || slugify(data.name)
  const exists = await Department.findOne({ $or: [{ slug }, { name: data.name }] })
  if (exists) {
    const error = new Error('Department already exists')
    error.status = 409
    throw error
  }
  return prisma.department.create({ ...data, slug })
}

async function updateDepartment(id, data) {
  if (data.name && !data.slug) data.slug = slugify(data.name)
  const department = await prisma.department.update({ id }, data)
  if (!department) {
    const error = new Error('Department not found')
    error.status = 404
    throw error
  }
  return department
}

async function getDepartment(id) {
  const department = await prisma.department.findUnique({ id })
  if (!department) {
    const error = new Error('Department not found')
    error.status = 404
    throw error
  }
  return department
}

async function removeDepartment(id) {
  const Doctor = require('../models/Doctor')
  const assignedDoctors = await Doctor.countDocuments({ departmentId: id })
  if (assignedDoctors) {
    const error = new Error('This department still has assigned doctors. Move or deactivate them before deleting it.')
    error.status = 409
    throw error
  }
  const department = await prisma.department.delete({ id })
  if (!department) {
    const error = new Error('Department not found')
    error.status = 404
    throw error
  }
  return { message: 'Department removed' }
}

module.exports = {
  listDepartments,
  createDepartment,
  updateDepartment,
  getDepartment,
  removeDepartment,
}
