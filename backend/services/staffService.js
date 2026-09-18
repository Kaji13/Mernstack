const bcrypt = require('bcryptjs')
const User = require('../models/User')
const memoryStore = require('../utils/memoryStore')
const { isDbConnected } = require('../utils/homeData')
const { publicUser } = require('../utils/tokens')

const STAFF_ROLES = new Set(['doctor', 'editor'])

function requireStaffRole(role) {
  if (!STAFF_ROLES.has(role)) {
    const error = new Error('Staff role must be doctor or editor')
    error.status = 400
    throw error
  }
}

async function listStaff() {
  const users = isDbConnected()
    ? await User.find({ role: { $in: ['admin', 'doctor', 'editor'] } }).sort({ name: 1 })
    : memoryStore.listUsers().filter((user) => ['admin', 'doctor', 'editor'].includes(user.role))
  return users.map(publicUser)
}

async function createStaff(data) {
  requireStaffRole(data.role)
  const email = String(data.email).toLowerCase()
  const existing = isDbConnected() ? await User.findOne({ email }) : memoryStore.findUserByEmail(email)
  if (existing) {
    const error = new Error('An account with that email already exists')
    error.status = 409
    throw error
  }
  const user = isDbConnected()
    ? await User.create({ ...data, email, isActive: true })
    : memoryStore.addUser({ ...data, email, password: await bcrypt.hash(data.password, 10), isActive: true })
  return publicUser(user)
}

async function updateStaff(id, data, actorId) {
  const existing = isDbConnected() ? await User.findById(id) : memoryStore.findUserById(id)
  if (!existing || !['admin', 'doctor', 'editor'].includes(existing.role)) {
    const error = new Error('Staff member not found')
    error.status = 404
    throw error
  }
  if (existing.role === 'admin') {
    const error = new Error('Administrator accounts cannot be changed from staff management')
    error.status = 403
    throw error
  }
  if (String(existing._id) === String(actorId) && (data.isActive === false || data.role)) {
    const error = new Error('You cannot deactivate or change your own role')
    error.status = 400
    throw error
  }
  if (data.role) requireStaffRole(data.role)
  const changes = { ...data }
  if (changes.password && !isDbConnected()) changes.password = await bcrypt.hash(changes.password, 10)
  let updated
  if (isDbConnected()) {
    Object.assign(existing, changes)
    await existing.save()
    updated = existing
  } else {
    updated = memoryStore.updateUser(id, changes)
  }
  return publicUser(updated)
}

module.exports = { listStaff, createStaff, updateStaff }
