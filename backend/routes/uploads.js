const express = require('express')
const { authenticate } = require('../middleware/auth')
const { upload } = require('../config/multer')
const uploadService = require('../services/uploadService')
const { isCloudinaryConfigured } = require('../utils/cloudinary')

const router = express.Router()

router.get('/status', authenticate, (_req, res) => {
  res.json({
    cloudinary: isCloudinaryConfigured(),
    provider: isCloudinaryConfigured() ? 'cloudinary' : 'local',
  })
})

router.post('/', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'File is required' })
    const stored = await uploadService.storeUpload(req.file, {
      ownerId: req.user._id,
      patientId: req.body.patientId || null,
      folder: req.body.folder || 'web-clinic',
    })
    res.status(201).json(stored)
  } catch (error) {
    next(error)
  }
})

module.exports = router
