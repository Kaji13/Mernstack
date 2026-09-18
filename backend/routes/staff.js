const express = require('express')
const { authenticate, authorize } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const { staffCreateSchema, staffUpdateSchema } = require('../validators/staff')
const staffService = require('../services/staffService')

const router = express.Router()
router.use(authenticate, authorize('admin'))

router.get('/', async (_req, res, next) => {
  try { res.json(await staffService.listStaff()) } catch (error) { next(error) }
})
router.post('/', validate(staffCreateSchema), async (req, res, next) => {
  try { res.status(201).json(await staffService.createStaff(req.body)) } catch (error) { next(error) }
})
router.patch('/:id', validate(staffUpdateSchema), async (req, res, next) => {
  try { res.json(await staffService.updateStaff(req.params.id, req.body, req.user._id)) } catch (error) { next(error) }
})

module.exports = router
