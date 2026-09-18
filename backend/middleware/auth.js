const User = require('../models/User')
const { isDbConnected } = require('../utils/homeData')
const memoryStore = require('../utils/memoryStore')
const { verifyAccessToken } = require('../utils/tokens')

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) {
      return res.status(401).json({ message: 'Access token required' })
    }

    const payload = verifyAccessToken(token)
    const user = isDbConnected()
      ? await User.findById(payload.id)
      : memoryStore.findUserById(payload.id)

    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }
    if (user.isActive === false) {
      return res.status(403).json({ message: 'This account has been deactivated' })
    }

    req.user = user
    req.tokenPayload = payload
    next()
  } catch (error) {
    error.status = 401
    error.message = 'Invalid or expired access token'
    next(error)
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' })
    }
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have access to this resource' })
    }
    next()
  }
}

async function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return next()

  try {
    const payload = verifyAccessToken(token)
    req.tokenPayload = payload
    req.user = isDbConnected()
      ? await User.findById(payload.id)
      : memoryStore.findUserById(payload.id)
  } catch {
    req.tokenPayload = null
  }
  next()
}

module.exports = { authenticate, authorize, optionalAuth }
