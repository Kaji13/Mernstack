const crypto = require('crypto')
const User = require('../models/User')
const RefreshToken = require('../models/RefreshToken')
const Otp = require('../models/Otp')
const Patient = require('../models/Patient')
const { isDbConnected } = require('../utils/homeData')
const memoryStore = require('../utils/memoryStore')
const { generateOtp, hashOtp, compareOtp } = require('../utils/otp')
const { sendMail } = require('../utils/mailer')
const {
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  publicUser,
} = require('../utils/tokens')

const PUBLIC_ROLES = new Set(['patient', 'editor', 'doctor'])

function requireDb() {
  if (!isDbConnected()) {
    const error = new Error('Database is required for this operation')
    error.status = 503
    throw error
  }
}

function tokenPair(user) {
  return {
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user),
    token: signAccessToken(user),
    user: publicUser(user),
  }
}

async function persistRefreshToken(user, refreshToken) {
  const decoded = verifyRefreshToken(refreshToken)
  await RefreshToken.create({
    userId: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(decoded.exp * 1000),
  })
}

async function register(payload) {
  const { name, email, password, phone } = payload
  let role = payload.role || 'patient'
  if (role === 'admin') role = 'patient'
  if (!PUBLIC_ROLES.has(role)) role = 'patient'

  if (!isDbConnected()) {
    const existing = memoryStore.findUserByEmail(email)
    if (existing) {
      const error = new Error('An account with that email already exists')
      error.status = 409
      throw error
    }
    const bcrypt = require('bcryptjs')
    const user = memoryStore.addUser({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role,
      phone: phone || '',
    })
    return { ...tokenPair(user), refreshToken: signRefreshToken(user) }
  }

  const existing = await User.findOne({ email: String(email).toLowerCase() })
  if (existing) {
    const error = new Error('An account with that email already exists')
    error.status = 409
    throw error
  }

  const user = await User.create({ name, email, password, phone, role })
  if (role === 'patient') {
    await Patient.create({
      userId: user._id,
      fullName: name,
      email: user.email,
      phone: phone || '0000000000',
    })
  }

  const tokens = tokenPair(user)
  await persistRefreshToken(user, tokens.refreshToken)
  return tokens
}

async function login({ email, password }) {
  const user = isDbConnected()
    ? await User.findOne({ email: String(email).toLowerCase() })
    : memoryStore.findUserByEmail(email)

  if (!user || !(await require('bcryptjs').compare(password, user.password))) {
    const error = new Error('Invalid email or password')
    error.status = 401
    throw error
  }

  const tokens = tokenPair(user)
  if (isDbConnected()) await persistRefreshToken(user, tokens.refreshToken)
  return tokens
}

async function refresh(refreshToken) {
  requireDb()
  const payload = verifyRefreshToken(refreshToken)
  const stored = await RefreshToken.findOne({
    tokenHash: hashToken(refreshToken),
    revokedAt: null,
  })
  if (!stored || stored.expiresAt < new Date()) {
    const error = new Error('Refresh token is invalid')
    error.status = 401
    throw error
  }

  const user = await User.findById(payload.id)
  if (!user) {
    const error = new Error('User not found')
    error.status = 401
    throw error
  }

  stored.revokedAt = new Date()
  await stored.save()

  const tokens = tokenPair(user)
  await persistRefreshToken(user, tokens.refreshToken)
  return tokens
}

async function logout(refreshToken) {
  if (!refreshToken || !isDbConnected()) return
  await RefreshToken.findOneAndUpdate(
    { tokenHash: hashToken(refreshToken) },
    { revokedAt: new Date() }
  )
}

async function sendOtp(email, purpose) {
  requireDb()
  const code = generateOtp()
  await Otp.updateMany({ email, purpose, consumedAt: null }, { consumedAt: new Date() })
  await Otp.create({
    email: String(email).toLowerCase(),
    purpose,
    codeHash: await hashOtp(code),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  })

  await sendMail({
    to: email,
    subject: `Your Web Clinic ${purpose} code`,
    text: `Your OTP is ${code}. It expires in 10 minutes.`,
  })

  return {
    message: 'OTP sent',
    ...(process.env.NODE_ENV === 'production' ? {} : { devOtp: code }),
  }
}

async function verifyOtp(email, purpose, code) {
  requireDb()
  const otp = await Otp.findOne({
    email: String(email).toLowerCase(),
    purpose,
    consumedAt: null,
  }).sort({ createdAt: -1 })

  if (!otp || otp.expiresAt < new Date()) {
    const error = new Error('OTP is invalid or expired')
    error.status = 400
    throw error
  }

  otp.attempts += 1
  if (otp.attempts > 5) {
    otp.consumedAt = new Date()
    await otp.save()
    const error = new Error('Too many OTP attempts')
    error.status = 429
    throw error
  }

  const ok = await compareOtp(code, otp.codeHash)
  if (!ok) {
    await otp.save()
    const error = new Error('OTP is invalid or expired')
    error.status = 400
    throw error
  }

  otp.consumedAt = new Date()
  await otp.save()

  if (purpose === 'verify') {
    await User.findOneAndUpdate({ email: String(email).toLowerCase() }, { isVerified: true })
  }

  return { verified: true }
}

async function resetPassword({ email, code, password }) {
  await verifyOtp(email, 'reset', code)
  const user = await User.findOne({ email: String(email).toLowerCase() })
  if (!user) {
    const error = new Error('User not found')
    error.status = 404
    throw error
  }
  user.password = password
  await user.save()
  await RefreshToken.updateMany({ userId: user._id, revokedAt: null }, { revokedAt: new Date() })
  return { message: 'Password updated' }
}

async function changePassword(user, { currentPassword, newPassword }) {
  const ok = await user.comparePassword(currentPassword)
  if (!ok) {
    const error = new Error('Current password is incorrect')
    error.status = 400
    throw error
  }
  user.password = newPassword
  await user.save()
  return { message: 'Password changed' }
}

function resetTokenId() {
  return crypto.randomBytes(8).toString('hex')
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  sendOtp,
  verifyOtp,
  resetPassword,
  changePassword,
  tokenPair,
  resetTokenId,
}
