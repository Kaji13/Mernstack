const express = require('express')
const { authenticate } = require('../middleware/auth')
const notificationService = require('../services/notificationService')

const router = express.Router()
router.use(authenticate)

router.get('/', async (req, res, next) => {
  try { res.json(await notificationService.listNotifications(req.user._id)) } catch (error) { next(error) }
})

router.patch('/read-all', async (req, res, next) => {
  try { res.json(await notificationService.markAllRead(req.user._id)) } catch (error) { next(error) }
})

router.patch('/:id/read', async (req, res, next) => {
  try { res.json(await notificationService.markRead(req.user._id, req.params.id)) } catch (error) { next(error) }
})

module.exports = router
