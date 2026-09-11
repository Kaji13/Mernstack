const { z } = require('zod')
const { objectId } = require('./patient')

const createAppointmentSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email(),
    phone: z.string().min(7, 'Phone is required'),
    date: z.string().min(1, 'Date is required'),
    department: z.string().optional(),
    message: z.string().optional(),
    doctorSlug: z.string().optional(),
    timeSlot: z.string().optional(),
    visitType: z.string().optional(),
    patientId: objectId.optional(),
  }),
})

const medicalRecordSchema = z.object({
  body: z.object({
    patientId: objectId,
    doctorId: objectId.optional(),
    appointmentId: objectId.optional(),
    diagnosis: z.string().min(2, 'Diagnosis is required'),
    notes: z.string().optional().default(''),
    prescriptions: z.array(z.string()).optional().default([]),
  }),
})

const recordIdParam = z.object({
  params: z.object({ id: objectId }),
})

const billingSchema = z.object({
  body: z.object({
    patientId: objectId,
    appointmentId: objectId.optional(),
    items: z.array(z.object({
      description: z.string().min(1),
      amount: z.coerce.number().min(0),
      quantity: z.coerce.number().min(1).optional(),
    })).min(1, 'At least one billing item is required'),
    tax: z.coerce.number().min(0).optional().default(0),
    notes: z.string().optional().default(''),
  }),
})

const billingIdParam = z.object({
  params: z.object({ id: objectId }),
})

const initiatePaymentSchema = z.object({
  body: z.object({
    appointmentId: objectId.optional(),
    billingId: objectId.optional(),
    amount: z.coerce.number().positive().optional(),
    returnUrl: z.string().url().optional(),
  }),
})

const verifyPaymentSchema = z.object({
  body: z.object({
    pidx: z.string().min(4, 'pidx is required'),
  }),
})

module.exports = {
  createAppointmentSchema,
  medicalRecordSchema,
  recordIdParam,
  billingSchema,
  billingIdParam,
  initiatePaymentSchema,
  verifyPaymentSchema,
}
