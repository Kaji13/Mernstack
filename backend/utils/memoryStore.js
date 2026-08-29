const appointments = []
const waitlist = []
const users = []

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function addAppointment(data) {
  const appointment = {
    _id: createId('apt'),
    status: 'confirmed',
    source: 'doctor-slot',
    createdAt: new Date().toISOString(),
    ...data,
  }
  appointments.push(appointment)
  return appointment
}

function hasBookedSlot(doctorSlug, dateKey, timeSlot) {
  return appointments.some(
    (item) =>
      item.doctorSlug === doctorSlug &&
      item.dateKey === dateKey &&
      item.timeSlot === timeSlot &&
      ['pending', 'confirmed'].includes(item.status)
  )
}

function bookedKeysFor(doctorSlug) {
  return new Set(
    appointments
      .filter((item) => item.doctorSlug === doctorSlug && item.timeSlot)
      .map((item) => `${item.dateKey}|${item.timeSlot}`)
  )
}

function upsertWaitlist(data) {
  const email = String(data.email).toLowerCase()
  const existing = waitlist.find(
    (item) => item.doctorSlug === data.doctorSlug && item.email === email
  )
  if (existing) {
    Object.assign(existing, data, { email, status: 'open' })
    return existing
  }
  const entry = {
    _id: createId('wait'),
    status: 'open',
    ...data,
    email,
  }
  waitlist.push(entry)
  return entry
}

function addUser(data) {
  const email = String(data.email).toLowerCase()
  const user = {
    _id: createId('user'),
    role: 'editor',
    ...data,
    email,
  }
  users.push(user)
  return user
}

function findUserByEmail(email) {
  const normalized = String(email).toLowerCase()
  return users.find((user) => user.email === normalized)
}

module.exports = {
  addAppointment,
  hasBookedSlot,
  bookedKeysFor,
  upsertWaitlist,
  addUser,
  findUserByEmail,
}
