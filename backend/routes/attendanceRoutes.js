import express from 'express'
import {
  clockIn,
  clockOut,
  getMyAttendance,
  getAllAttendance,
} from '../controllers/attendanceController.js'
import { protect, restrictTo } from '../middleware/auth.js'

const router = express.Router()

// All attendance routes require authentication
router.use(protect)

// Employee routes — any logged-in user
router.post('/clockin', clockIn)
// POST /api/attendance/clockin → employee clocks in

router.put('/clockout', clockOut)
// PUT /api/attendance/clockout → employee clocks out

router.get('/my', getMyAttendance)
// GET /api/attendance/my → employee views their own records + stats

// Admin routes
router.get('/', restrictTo('admin'), getAllAttendance)
// GET /api/attendance → admin views all attendance records

export default router
