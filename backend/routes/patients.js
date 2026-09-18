const express = require('express')
const { authenticate, authorize } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const { upload } = require('../config/multer')
const { createPatientSchema, updatePatientSchema, patientIdParam } = require('../validators/patient')
const patientService = require('../services/patientService')

const router = express.Router()

router.use(authenticate)

router.post('/', authorize('admin', 'editor', 'doctor', 'patient'), validate(createPatientSchema), async (req, res, next) => {
  try {
    const patient = await patientService.createPatient(req.body, req.user)
    res.status(201).json(patient)
  } catch (error) {
    next(error)
  }
})

router.get('/', authorize('admin', 'editor', 'doctor', 'patient'), async (req, res, next) => {
  try {
    const patients = await patientService.listPatients(req.user, req.query)
    res.json(patients)
  } catch (error) {
    next(error)
  }
})

router.get('/:id', validate(patientIdParam), async (req, res, next) => {
  try {
    const patient = await patientService.getPatient(req.params.id, req.user)
    res.json(patient)
  } catch (error) {
    next(error)
  }
})

router.patch('/:id', authorize('admin', 'editor', 'doctor', 'patient'), validate(updatePatientSchema), async (req, res, next) => {
  try {
    res.json(await patientService.updatePatient(req.params.id, req.body, req.user))
  } catch (error) {
    next(error)
  }
})

router.post(
  '/:id/files',
  validate(patientIdParam),
  upload.single('file'),
  async (req, res, next) => {
    try {
      const patient = await patientService.addPatientFile(
        req.params.id,
        req.file,
        req.user,
        req.body.label || ''
      )
      res.status(201).json(patient)
    } catch (error) {
      next(error)
    }
  }
)

module.exports = router
