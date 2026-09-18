const express = require('express')
const { authenticate, authorize, optionalAuth } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const { departmentSchema, departmentIdParam, departmentUpdateSchema } = require('../validators/clinic')
const departmentService = require('../services/departmentService')

const router = express.Router()

router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const departments = await departmentService.listDepartments(req.query)
    res.json(departments)
  } catch (error) {
    next(error)
  }
})

router.post('/', authenticate, authorize('admin', 'editor'), validate(departmentSchema), async (req, res, next) => {
  try {
    const department = await departmentService.createDepartment(req.body)
    res.status(201).json(department)
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'Department name or slug already exists' })
    next(error)
  }
})

router.get('/:id', validate(departmentIdParam), async (req, res, next) => {
  try {
    const department = await departmentService.getDepartment(req.params.id)
    res.json(department)
  } catch (error) {
    next(error)
  }
})

router.patch('/:id', authenticate, authorize('admin', 'editor'), validate(departmentUpdateSchema), async (req, res, next) => {
  try {
    const department = await departmentService.updateDepartment(req.params.id, req.body)
    res.json(department)
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'Department name or slug already exists' })
    next(error)
  }
})

router.delete('/:id', authenticate, authorize('admin'), validate(departmentIdParam), async (req, res, next) => {
  try {
    const result = await departmentService.removeDepartment(req.params.id)
    res.json(result)
  } catch (error) {
    next(error)
  }
})

module.exports = router
