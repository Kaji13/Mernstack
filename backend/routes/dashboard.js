const express = require('express')
const { authenticate } = require('../middleware/auth')
const dashboardService = require('../services/dashboardService')

const router = express.Router()

router.get('/', authenticate, async (req, res, next) => {
  try {
    const stats = await dashboardService.getStats(req.user)
    res.json(stats)
  } catch (error) {
    next(error)
  }
})

module.exports = router
