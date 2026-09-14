const windows = new Map()

function securityHeaders(_req, res, next) {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': "default-src 'self'; frame-ancestors 'none'; base-uri 'self'",
  })
  if (process.env.NODE_ENV === 'production') {
    res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  next()
}

function clean(value) {
  if (Array.isArray(value)) return value.map(clean)
  if (!value || typeof value !== 'object') return typeof value === 'string' ? value.replace(/\0/g, '').trim() : value
  return Object.entries(value).reduce((result, [key, item]) => {
    if (!key.includes('$') && key !== '__proto__' && key !== 'constructor' && key !== 'prototype') result[key] = clean(item)
    return result
  }, {})
}

function sanitizeInput(req, _res, next) {
  if (req.body) req.body = clean(req.body)
  if (req.query) req.query = clean(req.query)
  next()
}

function rateLimit({ windowMs = 60_000, max = 120 } = {}) {
  return (req, res, next) => {
    const now = Date.now()
    const key = `${req.ip}:${req.baseUrl}:${req.path}`
    const current = windows.get(key)
    const entry = !current || now - current.startedAt >= windowMs ? { startedAt: now, count: 0 } : current
    entry.count += 1
    windows.set(key, entry)
    res.set('RateLimit-Limit', String(max))
    res.set('RateLimit-Remaining', String(Math.max(0, max - entry.count)))
    if (entry.count > max) return res.status(429).json({ message: 'Too many requests. Please try again shortly.' })
    next()
  }
}

module.exports = { securityHeaders, sanitizeInput, rateLimit }
