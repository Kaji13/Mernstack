const express = require('express')
const { getServicesData } = require('../utils/servicesData')

const router = express.Router()

router.get('/', async (_req, res, next) => {
  try {
    const data = await getServicesData()
    res.json(data)
  } catch (error) {
    next(error)
  }
})

module.exports = router
