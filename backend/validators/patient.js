const { z } = require('zod')

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id')

const createPatientSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name is required'),
    email: z.string().email(),
    phone: z.string().min(7, 'Phone is required'),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['male', 'female', 'other', '']).optional(),
    address: z.string().optional(),
    bloodGroup: z.string().optional(),
    notes: z.string().optional(),
    userId: objectId.optional(),
  }),
})

const patientIdParam = z.object({
  params: z.object({ id: objectId }),
})

module.exports = { createPatientSchema, patientIdParam, objectId }
