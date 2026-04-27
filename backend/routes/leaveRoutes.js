import express from 'express'
import {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  reviewLeave,
} from '../controllers/leaveController.js'
import { protect, restrictTo } from '../middleware/auth.js'

const router = express.Router()

// All leave routes require authentication
router.use(protect)

// Employee routes
router.post('/', applyLeave)
// POST /api/leaves → employee applies for leave

// ⚠️ /my MUST be defined BEFORE /:id
// Otherwise Express treats 'my' as an :id parameter
router.get('/my', getMyLeaves)
// GET /api/leaves/my → employee views their leave requests + summary

// Admin routes
router.get('/', restrictTo('admin'), getAllLeaves)
// GET /api/leaves → admin views all leave requests (optional ?status=)

router.put('/:id/review', restrictTo('admin'), reviewLeave)
// PUT /api/leaves/:id/review → admin approves or rejects a request

export default router
