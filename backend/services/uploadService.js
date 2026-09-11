const prisma = require('./prisma')
const { uploadFile } = require('../utils/cloudinary')

async function storeUpload(file, { ownerId, patientId, folder }) {
  const uploaded = await uploadFile(file, folder || 'web-clinic')
  return prisma.fileUpload.create({
    ownerId: ownerId || null,
    patientId: patientId || null,
    folder: folder || 'web-clinic',
    ...uploaded,
  })
}

module.exports = { storeUpload }
