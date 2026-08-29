const catalog = require('../data/doctorsCatalog')
const Doctor = require('../models/Doctor')
const DoctorSpecialty = require('../models/DoctorSpecialty')
const DoctorHighlight = require('../models/DoctorHighlight')
const DoctorVisitStep = require('../models/DoctorVisitStep')
const Appointment = require('../models/Appointment')
const { isDbConnected } = require('./homeData')
const { buildDoctorSchedule, parseDateKey, toDateKey } = require('./slots')
const memoryStore = require('./memoryStore')

const publicFields = [
  'slug',
  'name',
  'initials',
  'specialtyId',
  'specialtyLabel',
  'title',
  'experience',
  'patients',
  'rating',
  'reviewCount',
  'available',
  'featured',
  'languages',
  'education',
  'clinicDays',
  'consultation',
  'accent',
  'bio',
  'focusAreas',
  'workDays',
  'slotTimes',
  'visitTypes',
  'order',
]

const toPublicDoctor = (doc) => {
  const item = doc.toObject ? doc.toObject() : doc
  const doctor = { id: item.slug }
  publicFields.forEach((field) => {
    doctor[field] = item[field]
  })
  doctor.specialty = item.specialtyId
  return doctor
}

const getSeedDoctorsPage = () => ({
  specialties: catalog.specialties.map(({ slug, label }) => ({ id: slug, label })),
  doctors: catalog.doctors.map(toPublicDoctor),
  highlights: catalog.highlights.map(({ icon, title, description }) => ({ icon, title, description })),
  visitSteps: catalog.visitSteps.map(({ step, title, description }) => ({ step, title, description })),
})

function summarizeDoctors(doctors) {
  const ratings = doctors.map((doctor) => doctor.rating).filter(Boolean)
  const averageRating = ratings.length
    ? Number((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1))
    : 0

  return {
    total: doctors.length,
    available: doctors.filter((doctor) => doctor.available).length,
    averageRating,
  }
}

async function getDoctorsPageData() {
  if (!isDbConnected()) {
    const seed = getSeedDoctorsPage()
    return { ...seed, stats: summarizeDoctors(seed.doctors) }
  }

  const [specialties, doctors, highlights, visitSteps] = await Promise.all([
    DoctorSpecialty.find().sort({ order: 1 }).lean(),
    Doctor.find().sort({ order: 1 }).lean(),
    DoctorHighlight.find().sort({ order: 1 }).lean(),
    DoctorVisitStep.find().sort({ order: 1 }).lean(),
  ])

  const hasData = specialties.length || doctors.length || highlights.length || visitSteps.length
  if (!hasData) {
    const seed = getSeedDoctorsPage()
    return { ...seed, stats: summarizeDoctors(seed.doctors) }
  }

  const seed = getSeedDoctorsPage()
  const mappedDoctors = doctors.length ? doctors.map(toPublicDoctor) : seed.doctors

  return {
    specialties: specialties.length
      ? specialties.map(({ slug, label }) => ({ id: slug, label }))
      : seed.specialties,
    doctors: mappedDoctors,
    highlights: highlights.length
      ? highlights.map(({ icon, title, description }) => ({ icon, title, description }))
      : seed.highlights,
    visitSteps: visitSteps.length
      ? visitSteps.map(({ step, title, description }) => ({ step, title, description }))
      : seed.visitSteps,
    stats: summarizeDoctors(mappedDoctors),
  }
}

async function findDoctorBySlug(slug) {
  if (!slug) return null

  if (isDbConnected()) {
    const doctor = await Doctor.findOne({ slug }).lean()
    if (doctor) return toPublicDoctor(doctor)
  }

  const fallback = catalog.doctors.find((doctor) => doctor.slug === slug)
  return fallback ? toPublicDoctor(fallback) : null
}

async function getBookedSlotKeys(doctorSlug, fromDate, toDate) {
  const memoryKeys = memoryStore.bookedKeysFor(doctorSlug)
  if (!isDbConnected() || !doctorSlug) return memoryKeys

  const booked = await Appointment.find({
    doctorSlug,
    status: { $in: ['pending', 'confirmed'] },
    date: { $gte: fromDate, $lte: toDate },
    timeSlot: { $ne: '' },
  })
    .select('date timeSlot')
    .lean()

  return new Set([
    ...memoryKeys,
    ...booked.map((item) => `${toDateKey(new Date(item.date))}|${item.timeSlot}`),
  ])
}

async function getDoctorSchedule(slug) {
  const doctor = await findDoctorBySlug(slug)
  if (!doctor) return null

  const fromDate = new Date()
  const toDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  const bookedKeys = await getBookedSlotKeys(slug, fromDate, toDate)
  const schedule = buildDoctorSchedule(doctor, bookedKeys)

  return { doctor, schedule }
}

async function isSlotTaken(doctorSlug, dateKey, timeSlot) {
  const date = parseDateKey(dateKey)
  if (!date) return true
  if (memoryStore.hasBookedSlot(doctorSlug, dateKey, timeSlot)) return true
  if (!isDbConnected()) return false

  const existing = await Appointment.findOne({
    doctorSlug,
    date,
    timeSlot,
    status: { $in: ['pending', 'confirmed'] },
  }).lean()

  return Boolean(existing)
}

module.exports = {
  getDoctorsPageData,
  findDoctorBySlug,
  getDoctorSchedule,
  isSlotTaken,
  toPublicDoctor,
  getSeedDoctorsPage,
}
