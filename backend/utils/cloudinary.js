const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const cloudinary = require('cloudinary').v2

const uploadsDir = path.join(__dirname, '..', 'uploads')

function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  )
}

function configureCloudinary() {
  if (!isCloudinaryConfigured()) return
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

configureCloudinary()

async function saveLocalFile(file) {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }
  const ext = path.extname(file.originalname || '') || ''
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`
  const filepath = path.join(uploadsDir, filename)
  fs.writeFileSync(filepath, file.buffer)
  return {
    url: `/uploads/${filename}`,
    publicId: filename,
    provider: 'local',
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
  }
}

function uploadBuffer(file, folder = 'web-clinic') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) return reject(error)
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          provider: 'cloudinary',
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
        })
      }
    )
    stream.end(file.buffer)
  })
}

async function uploadFile(file, folder = 'web-clinic') {
  if (!file) {
    throw Object.assign(new Error('No file provided'), { status: 400 })
  }
  if (isCloudinaryConfigured()) {
    return uploadBuffer(file, folder)
  }
  return saveLocalFile(file)
}

async function deleteFile(publicId, provider = 'cloudinary') {
  if (provider === 'cloudinary' && isCloudinaryConfigured() && publicId) {
    await cloudinary.uploader.destroy(publicId)
    return
  }
  if (provider === 'local' && publicId) {
    const filepath = path.join(uploadsDir, publicId)
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath)
  }
}

module.exports = { uploadFile, deleteFile, isCloudinaryConfigured, uploadsDir }
