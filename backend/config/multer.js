const multer = require('multer')

const allowedTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
])

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: Number(process.env.MAX_UPLOAD_BYTES || 5 * 1024 * 1024) },
  fileFilter: (_req, file, cb) => {
    if (allowedTypes.has(file.mimetype)) {
      cb(null, true)
      return
    }
    cb(Object.assign(new Error('Only JPEG, PNG, WebP, and PDF files are allowed'), { status: 400 }))
  },
})

module.exports = { upload }
