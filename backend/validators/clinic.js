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
    name: z.string().trim().min(2, 'Name is required'),
    slug: z.string().trim().min(2).optional(),
    initials: z.string().trim().min(1).optional(),
    specialtyId: z.string().trim().min(1, 'Specialty is required'),
    specialtyLabel: z.string().trim().min(1, 'Specialty is required'),
    title: z.string().trim().min(1, 'Professional title is required'),
    experience: z.string().trim().min(1, 'Experience is required'),
    patients: z.string().optional().default('0'),
    rating: z.coerce.number().min(0).max(5).optional().default(5),
    education: z.string().trim().min(2, 'Education is required'),
    clinicDays: z.string().optional().default('Sun–Fri'),
    consultation: z.string().optional().default('By appointment'),
    consultationFee: z.coerce.number().min(0).optional().default(0),
    accent: z.string().optional().default('navy'),
    bio: z.string().trim().min(20, 'Bio must be at least 20 characters'),
    departmentId: objectId.optional(),
    userId: objectId.optional(),
    languages: z.array(z.string().trim().min(1)).min(1, 'Add at least one language').optional(),
    focusAreas: z.array(z.string().trim().min(1)).min(1, 'Add at least one focus area').optional(),
    workDays: z.array(z.number().int().min(0).max(6)).min(1, 'Select at least one clinic day').optional(),
    slotTimes: z.array(z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Slots must use HH:MM time')).min(1, 'Add at least one appointment time').optional(),
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
