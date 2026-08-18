const express = require('express')
const { getHomeData } = require('../utils/homeData')

const router = express.Router()

router.get('/', async (_req, res, next) => {
  try {
    const data = await getHomeData()
    res.json(data)
  } catch (error) {
    next(error)
  }
})

module.exports = router
