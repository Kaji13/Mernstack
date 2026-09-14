const express = require('express')
const { authenticate, authorize } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const { medicalRecordSchema, recordIdParam } = require('../validators/clinical')
const medicalRecordService = require('../services/medicalRecordService')

const router = express.Router()

router.use(authenticate)

router.get('/', async (req, res, next) => {
  try {
    const records = await medicalRecordService.listRecords(req.query, req.user)
    res.json(records)
  } catch (error) {
    next(error)
  }
})

router.post('/', authorize('admin', 'editor', 'doctor'), validate(medicalRecordSchema), async (req, res, next) => {
  try {
    const record = await medicalRecordService.createRecord(req.body, req.user)
    res.status(201).json(record)
  } catch (error) {
    next(error)
  }
})

router.get('/:id', validate(recordIdParam), async (req, res, next) => {
  try {
    const record = await medicalRecordService.getRecord(req.params.id)
    res.json(record)
  } catch (error) {
    next(error)
  }
})

router.patch('/:id', authorize('admin', 'editor', 'doctor'), validate(recordIdParam), async (req, res, next) => {
  try {
    const record = await medicalRecordService.updateRecord(req.params.id, req.body)
    res.json(record)
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', authorize('admin'), validate(recordIdParam), async (req, res, next) => {
  try {
    const result = await medicalRecordService.removeRecord(req.params.id)
    res.json(result)
  } catch (error) {
    next(error)
  }
})

module.exports = router
