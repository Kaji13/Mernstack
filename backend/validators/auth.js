const { z } = require('zod')

const email = z.string().email('Valid email is required')
const password = z.string().min(6, 'Password must be at least 6 characters')

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    email,
    password,
    phone: z.string().optional().default(''),
    role: z.enum(['admin', 'editor', 'doctor', 'patient']).optional(),
  }),
})

const loginSchema = z.object({
  body: z.object({
    email,
    password: z.string().min(1, 'Password is required'),
  }),
})

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(10, 'Refresh token is required'),
  }),
})

const otpSendSchema = z.object({
  body: z.object({
    email,
    purpose: z.enum(['verify', 'login', 'reset']),
  }),
})

const otpVerifySchema = z.object({
  body: z.object({
    email,
    purpose: z.enum(['verify', 'login', 'reset']),
    code: z.string().length(6, 'OTP must be 6 digits'),
  }),
})

const forgotPasswordSchema = z.object({
  body: z.object({ email }),
})

const resetPasswordSchema = z.object({
  body: z.object({
    email,
    code: z.string().length(6, 'OTP must be 6 digits'),
    password,
  }),
})

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: password,
  }),
})

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  otpSendSchema,
  otpVerifySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
}
