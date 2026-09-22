const express = require('express')
const { authenticate, authorize } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const { doctorCreateSchema, doctorIdParam } = require('../validators/clinic')
const doctorService = require('../services/doctorService')

const router = express.Router()

router.get('/', authenticate, async (req, res, next) => {
  try {
    const doctors = await doctorService.listDoctors(req.query)
    res.json(doctors)
  } catch (error) {
    next(error)
  }
})

router.get('/me', authenticate, authorize('doctor'), async (req, res, next) => {
  try {
    const doctor = await doctorService.getDoctorForUser(req.user._id)
    res.json({ doctor })
  } catch (error) {
    next(error)
  }
})

router.post('/', authenticate, authorize('admin', 'editor', 'doctor'), validate(doctorCreateSchema), async (req, res, next) => {
  try {
    const data = req.user.role === 'doctor'
      ? { ...req.body, userId: req.user._id, name: req.user.name }
      : req.body
    const doctor = await doctorService.createDoctor(data)
    res.status(201).json(doctor)
  } catch (error) {
    next(error)
  }
})

router.get('/:id', authenticate, validate(doctorIdParam), async (req, res, next) => {
  try {
    const doctor = await doctorService.getDoctor(req.params.id)
    res.json(doctor)
  } catch (error) {
    next(error)
  }
})

router.patch('/:id', authenticate, authorize('admin', 'editor'), validate(doctorIdParam), async (req, res, next) => {
  try {
    const doctor = await doctorService.updateDoctor(req.params.id, req.body)
    res.json(doctor)
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', authenticate, authorize('admin'), validate(doctorIdParam), async (req, res, next) => {
  try {
    const result = await doctorService.removeDoctor(req.params.id)
    res.json(result)
  } catch (error) {
    next(error)
  }
})

module.exports = router
