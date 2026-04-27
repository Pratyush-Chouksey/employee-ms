import express from 'express'
import {
  register,
  login,
  logout,
  getMe,
  updateMe,
  updatePassword,
} from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()
// express.Router() creates a mini Express app
// We can define routes on it and mount it in server.js

// Public routes — no login required
router.post('/register', register)
// POST /api/auth/register → calls register controller

router.post('/login', login)
// POST /api/auth/login → calls login controller

// Private routes — must be logged in
router.post('/logout', protect, logout)
// protect runs first → then logout
// If protect fails, logout never runs

router.get('/me', protect, getMe)
// GET /api/auth/me → get current user's data

router.put('/updateme', protect, updateMe)
// PUT /api/auth/updateme → update logged-in user's name

router.put('/updatepassword', protect, updatePassword)
// PUT /api/auth/updatepassword → change password

export default router