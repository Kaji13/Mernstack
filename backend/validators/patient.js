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

const updatePatientSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    fullName: z.string().min(2, 'Full name is required').optional(),
    email: z.string().email('Valid email is required').optional(),
    phone: z.string().min(7, 'Phone is required').optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['male', 'female', 'other', '']).optional(),
    address: z.string().optional(),
    bloodGroup: z.string().optional(),
    notes: z.string().optional(),
  }).refine((body) => Object.keys(body).length > 0, 'At least one change is required'),
})

module.exports = { createPatientSchema, updatePatientSchema, patientIdParam, objectId }
