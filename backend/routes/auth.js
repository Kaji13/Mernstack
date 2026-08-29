const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const { isDbConnected } = require('../utils/homeData')
const memoryStore = require('../utils/memoryStore')

const router = express.Router()

function signToken(user) {
  return jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  })
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  }
}

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    if (isDbConnected()) {
      const existing = await User.findOne({ email: String(email).toLowerCase() })
      if (existing) {
        return res.status(409).json({ message: 'An account with that email already exists' })
      }

      const user = await User.create({ name, email, password, role })

      return res.status(201).json({
        message: 'User registered successfully',
        token: signToken(user),
        user: publicUser(user),
      })
    }

    const existing = memoryStore.findUserByEmail(email)
    if (existing) {
      return res.status(409).json({ message: 'An account with that email already exists' })
    }

    const salt = await bcrypt.genSalt(10)
    const user = memoryStore.addUser({ name, email, password: await bcrypt.hash(password, salt), role })

    return res.status(201).json({
      message: 'User registered successfully',
      token: signToken(user),
      user: publicUser(user),
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'An account with that email already exists' })
    }
    next(error)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = isDbConnected()
      ? await User.findOne({ email: String(email).toLowerCase() })
      : memoryStore.findUserByEmail(email)

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    res.json({
      message: 'Logged in successfully',
      token: signToken(user),
      user: publicUser(user),
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router