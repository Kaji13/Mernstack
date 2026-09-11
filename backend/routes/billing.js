const express = require('express')
const { authenticate, authorize } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const { billingSchema, billingIdParam } = require('../validators/clinical')
const billingService = require('../services/billingService')

const router = express.Router()

router.use(authenticate)

router.get('/', async (req, res, next) => {
  try {
    const bills = await billingService.listBills(req.query, req.user)
    res.json(bills)
  } catch (error) {
    next(error)
  }
})

router.post('/', authorize('admin', 'editor', 'doctor'), validate(billingSchema), async (req, res, next) => {
  try {
    const bill = await billingService.createBill(req.body)
    res.status(201).json(bill)
  } catch (error) {
    next(error)
  }
})

router.get('/:id', validate(billingIdParam), async (req, res, next) => {
  try {
    const bill = await billingService.getBill(req.params.id)
    res.json(bill)
  } catch (error) {
    next(error)
  }
})

router.patch('/:id', authorize('admin', 'editor'), validate(billingIdParam), async (req, res, next) => {
  try {
    const bill = await billingService.updateBill(req.params.id, req.body)
    res.json(bill)
  } catch (error) {
    next(error)
  }
})

router.post('/:id/pay', validate(billingIdParam), async (req, res, next) => {
  try {
    const result = await billingService.payBill(req.params.id, req.body.returnUrl)
    res.json(result)
  } catch (error) {
    next(error)
  }
})

module.exports = router
