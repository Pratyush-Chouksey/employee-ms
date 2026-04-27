import express from 'express'
import {
  getAllEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employeeController.js'
import { protect, restrictTo } from '../middleware/auth.js'

const router = express.Router()

// All employee routes require authentication
router.use(protect)
// router.use(protect) applies protect middleware to EVERY route
// below this line — no need to add it individually

// GET /api/employees  → admin gets all employees (with search/filter)
// POST /api/employees → admin creates a new employee
router
  .route('/')
  .get(restrictTo('admin'), getAllEmployees)
  .post(restrictTo('admin'), createEmployee)

// GET /api/employees/:id    → admin or the employee themselves
// PUT /api/employees/:id    → admin only
// DELETE /api/employees/:id → admin only (soft delete)
router
  .route('/:id')
  .get(getEmployee)
  .put(restrictTo('admin'), updateEmployee)
  .delete(restrictTo('admin'), deleteEmployee)

export default router
