const crypto = require('crypto')
const jwt = require('jsonwebtoken')

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function signAccessToken(user) {
  return jwt.sign(
    { id: user._id || user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_TTL || '15m' }
  )
}

function signRefreshToken(user) {
  return jwt.sign(
    { id: user._id || user.id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_TTL || '7d' }
  )
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET)
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET)
}

function publicUser(user) {
  return {
    id: user._id || user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || '',
    isVerified: Boolean(user.isVerified),
  }
}

module.exports = {
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  publicUser,
}
