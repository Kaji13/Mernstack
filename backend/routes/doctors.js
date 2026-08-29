const express = require('express')
const WaitlistEntry = require('../models/WaitlistEntry')
const { getDoctorsPageData, findDoctorBySlug, getDoctorSchedule } = require('../utils/doctorsData')
const { isDbConnected } = require('../utils/homeData')
const memoryStore = require('../utils/memoryStore')

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const data = await getDoctorsPageData()
    const { specialty, q, available } = req.query

    let doctors = data.doctors
    if (specialty && specialty !== 'all') {
      doctors = doctors.filter((doctor) => doctor.specialtyId === specialty)
    }
    if (available === 'true' || available === 'false') {
      const flag = available === 'true'
      doctors = doctors.filter((doctor) => doctor.available === flag)
    }
    if (q) {
      const query = String(q).trim().toLowerCase()
      doctors = doctors.filter((doctor) => {
        return (
          doctor.name.toLowerCase().includes(query) ||
          doctor.specialtyLabel.toLowerCase().includes(query) ||
          doctor.title.toLowerCase().includes(query) ||
          doctor.focusAreas.some((area) => area.toLowerCase().includes(query)) ||
          doctor.languages.some((lang) => lang.toLowerCase().includes(query))
        )
      })
    }

    res.json({
      ...data,
      doctors,
      stats: {
        ...data.stats,
        filtered: doctors.length,
      },
    })
  } catch (error) {
    next(error)
  }
})

router.get('/:slug/schedule', async (req, res, next) => {
  try {
    const payload = await getDoctorSchedule(req.params.slug)
    if (!payload) {
      return res.status(404).json({ message: 'Doctor not found' })
    }
    res.json(payload)
  } catch (error) {
    next(error)
  }
})

router.post('/:slug/waitlist', async (req, res, next) => {
  try {
    const doctor = await findDoctorBySlug(req.params.slug)
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' })
    }

    const { name, email, phone, preferredDays, note } = req.body
    if (!name || !email || !phone) {
      return res.status(400).json({ message: 'Name, email, and phone are required' })
    }

    if (!isDbConnected()) {
      const entry = memoryStore.upsertWaitlist({
        doctorSlug: doctor.slug,
        doctorName: doctor.name,
        name,
        email,
        phone,
        preferredDays: preferredDays || '',
        note: note || '',
      })

      return res.status(201).json({
        message: `You're on ${doctor.name}'s waitlist. We'll contact you when a slot opens.`,
        entry: {
          id: entry._id.toString ? entry._id.toString() : entry._id,
          doctorSlug: entry.doctorSlug,
          doctorName: entry.doctorName,
          status: entry.status,
        },
      })
    }

    const entry = await WaitlistEntry.findOneAndUpdate(
      { doctorSlug: doctor.slug, email: String(email).toLowerCase() },
      {
        doctorSlug: doctor.slug,
        doctorName: doctor.name,
        name,
        email,
        phone,
        preferredDays: preferredDays || '',
        note: note || '',
        status: 'open',
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )

    res.status(201).json({
      message: `You're on ${doctor.name}'s waitlist. We'll contact you when a slot opens.`,
      entry: {
        id: entry._id.toString(),
        doctorSlug: entry.doctorSlug,
        doctorName: entry.doctorName,
        status: entry.status,
      },
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'You are already on this doctor\'s waitlist.',
      })
    }
    next(error)
  }
})

router.get('/:slug', async (req, res, next) => {
  try {
    const doctor = await findDoctorBySlug(req.params.slug)
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' })
    }
    res.json(doctor)
  } catch (error) {
    next(error)
  }
})

module.exports = router
