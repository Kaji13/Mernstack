const express = require('express')
const { validate } = require('../middleware/validate')
const { authenticate } = require('../middleware/auth')
const {
  registerSchema,
  loginSchema,
  refreshSchema,
  otpSendSchema,
  otpVerifySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} = require('../validators/auth')
const authService = require('../services/authService')

const router = express.Router()

router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const result = await authService.register(req.body)
    res.status(201).json({ message: 'User registered successfully', ...result })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'An account with that email already exists' })
    }
    next(error)
  }
})

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const result = await authService.login(req.body)
    res.json({ message: 'Logged in successfully', ...result })
  } catch (error) {
    next(error)
  }
})

router.post('/refresh', validate(refreshSchema), async (req, res, next) => {
  try {
    const result = await authService.refresh(req.body.refreshToken)
    res.json({ message: 'Token refreshed', ...result })
  } catch (error) {
    error.status = error.status || 401
    next(error)
  }
})

router.post('/logout', async (req, res, next) => {
  try {
    await authService.logout(req.body?.refreshToken)
    res.json({ message: 'Logged out' })
  } catch (error) {
    next(error)
  }
})

router.post('/otp/send', validate(otpSendSchema), async (req, res, next) => {
  try {
    const result = await authService.sendOtp(req.body.email, req.body.purpose)
    res.json(result)
  } catch (error) {
    next(error)
  }
})

router.post('/otp/verify', validate(otpVerifySchema), async (req, res, next) => {
  try {
    const result = await authService.verifyOtp(req.body.email, req.body.purpose, req.body.code)
    res.json(result)
  } catch (error) {
    next(error)
  }
})

router.post('/password/forgot', validate(forgotPasswordSchema), async (req, res, next) => {
  try {
    const result = await authService.sendOtp(req.body.email, 'reset')
    res.json({ message: 'If that account exists, an OTP was sent', ...result })
  } catch (error) {
    next(error)
  }
})

router.post('/password/reset', validate(resetPasswordSchema), async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.body)
    res.json(result)
  } catch (error) {
    next(error)
  }
})

router.post('/password/change', authenticate, validate(changePasswordSchema), async (req, res, next) => {
  try {
    const result = await authService.changePassword(req.user, req.body)
    res.json(result)
  } catch (error) {
    next(error)
  }
})

router.get('/me', authenticate, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      phone: req.user.phone,
      isVerified: req.user.isVerified,
      isActive: req.user.isActive !== false,
    },
  })
})

module.exports = router
