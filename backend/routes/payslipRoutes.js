import express from 'express'
import {
  generatePayslip,
  getAllPayslips,
  getMyPayslips,
} from '../controllers/payslipController.js'
import { protect, restrictTo } from '../middleware/auth.js'

const router = express.Router()

// All payslip routes require authentication
router.use(protect)

// ⚠️ /my MUST be defined BEFORE any /:id routes
// Otherwise Express treats 'my' as an :id parameter
router.get('/my', getMyPayslips)
// GET /api/payslips/my → employee views their own payslips

// Admin routes
router
  .route('/')
  .get(restrictTo('admin'), getAllPayslips)
  .post(restrictTo('admin'), generatePayslip)
// GET  /api/payslips → admin views all payslips
// POST /api/payslips → admin generates a new payslip

export default router
