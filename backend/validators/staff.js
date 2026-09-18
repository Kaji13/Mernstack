const { z } = require('zod')

const userId = z.string().min(1, 'Staff member id is required')
const password = z.string().min(8, 'Password must be at least 8 characters')

const staffCreateSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Valid email is required'),
    password,
    phone: z.string().optional().default(''),
    role: z.enum(['doctor', 'editor']),
  }),
})

const staffUpdateSchema = z.object({
  params: z.object({ id: userId }),
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    role: z.enum(['doctor', 'editor']).optional(),
    isActive: z.boolean().optional(),
    password: password.optional(),
  }).refine((body) => Object.keys(body).length > 0, 'At least one change is required'),
})

module.exports = { staffCreateSchema, staffUpdateSchema }
