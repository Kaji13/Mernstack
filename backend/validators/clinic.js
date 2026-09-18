const { z } = require('zod')
const { objectId } = require('./patient')

const departmentSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Department name is required'),
    slug: z.string().min(2).optional(),
    description: z.string().optional().default(''),
    isActive: z.boolean().optional(),
  }),
})

const departmentIdParam = z.object({
  params: z.object({ id: objectId }),
})

const departmentUpdateSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    name: z.string().min(2, 'Department name is required').optional(),
    slug: z.string().min(2).optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
  }).refine((body) => Object.keys(body).length > 0, 'At least one change is required'),
})

const doctorCreateSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    slug: z.string().min(2).optional(),
    initials: z.string().min(1).optional(),
    specialtyId: z.string().min(1),
    specialtyLabel: z.string().min(1),
    title: z.string().min(1),
    experience: z.string().min(1),
    patients: z.string().optional().default('0'),
    rating: z.coerce.number().min(0).max(5).optional().default(5),
    education: z.string().min(1),
    clinicDays: z.string().optional().default('Sun–Fri'),
    consultation: z.string().optional().default('By appointment'),
    consultationFee: z.coerce.number().min(0).optional().default(0),
    accent: z.string().optional().default('navy'),
    bio: z.string().min(1),
    departmentId: objectId.optional(),
    userId: objectId.optional(),
    languages: z.array(z.string()).optional(),
    focusAreas: z.array(z.string()).optional(),
    workDays: z.array(z.number().min(0).max(6)).optional(),
    slotTimes: z.array(z.string()).optional(),
    available: z.boolean().optional(),
  }),
})

const doctorIdParam = z.object({
  params: z.object({ id: objectId }),
})

module.exports = {
  departmentSchema,
  departmentIdParam,
  departmentUpdateSchema,
  doctorCreateSchema,
  doctorIdParam,
}
