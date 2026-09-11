const crypto = require('crypto')
const bcrypt = require('bcryptjs')

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000))
}

function hashOtp(code) {
  return bcrypt.hash(code, 10)
}

function compareOtp(code, hash) {
  return bcrypt.compare(code, hash)
}

module.exports = { generateOtp, hashOtp, compareOtp }
