import Employee from '../models/Employee.js'
import User from '../models/User.js'

// ─────────────────────────────────────────────────────────
// @desc    Get all employees (with search & filter)
// @route   GET /api/employees
// @access  Private/Admin
// ─────────────────────────────────────────────────────────
export const getAllEmployees = async (req, res) => {
  try {
    // Start with base filter — only active employees
    const filter = { isActive: true }

    // Search by name, position, or employeeId (case-insensitive)
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { position: { $regex: req.query.search, $options: 'i' } },
        { employeeId: { $regex: req.query.search, $options: 'i' } },
      ]
      // $regex allows partial matching — 'joh' matches 'John'
      // $options: 'i' makes it case-insensitive
      // $or matches ANY of the conditions (like SQL OR)
    }

    // Filter by department (exact match)
    if (req.query.department) {
      filter.department = req.query.department
    }

    const employees = await Employee.find(filter)
      .populate('user', 'email role')
      // populate('user', 'email role') → fetch only email & role
      // from the linked User document (like a SQL SELECT)
      .sort({ createdAt: -1 })
      // -1 = descending (newest first)

    res.status(200).json({
      success: true,
      count: employees.length,
      employees,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ─────────────────────────────────────────────────────────
// @desc    Get single employee by ID
// @route   GET /api/employees/:id
// @access  Private (admin or the employee themselves)
// ─────────────────────────────────────────────────────────
export const getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('user', 'email role')

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      })
    }

    // Authorization check: admin can view anyone,
    // employees can only view their own profile
    if (
      req.user.role !== 'admin' &&
      employee.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this employee',
      })
    }

    res.status(200).json({
      success: true,
      employee,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ─────────────────────────────────────────────────────────
// @desc    Create a new employee (and their user account)
// @route   POST /api/employees
// @access  Private/Admin
// ─────────────────────────────────────────────────────────
export const createEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      position,
      department,
      salary,
      phone,
      joiningDate,
    } = req.body

    // 1. Check if a user with this email already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      })
    }

    // 2. Create the User account
    // Default password is '123456' if admin doesn't provide one
    const user = await User.create({
      name,
      email,
      password: password || '123456',
      role: 'employee',
    })

    // 3. Create the Employee profile linked to that user
    const employee = await Employee.create({
      user: user._id,
      name,
      email,
      position,
      department,
      salary,
      phone,
      joiningDate,
    })

    // 4. Link employee back to user document
    user.employee = employee._id
    await user.save()
    // pre-save hook won't re-hash password because
    // isModified('password') is false here

    // 5. Return the employee with populated user data
    const populatedEmployee = await Employee.findById(employee._id)
      .populate('user', 'email role')

    res.status(201).json({
      success: true,
      employee: populatedEmployee,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ─────────────────────────────────────────────────────────
// @desc    Update employee details
// @route   PUT /api/employees/:id
// @access  Private/Admin
// ─────────────────────────────────────────────────────────
export const updateEmployee = async (req, res) => {
  try {
    // Only allow these specific fields to be updated
    const allowedFields = ['name', 'position', 'department', 'salary', 'phone', 'bio']
    const fieldsToUpdate = {}

    // Pick only the allowed fields from the request body
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        fieldsToUpdate[field] = req.body[field]
      }
    })

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
      // new: true  → return updated doc, not the old one
      // runValidators: true → enforce schema validations
    ).populate('user', 'email role')

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      })
    }

    res.status(200).json({
      success: true,
      employee,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ─────────────────────────────────────────────────────────
// @desc    Delete employee (soft delete)
// @route   DELETE /api/employees/:id
// @access  Private/Admin
// ─────────────────────────────────────────────────────────
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      })
    }

    // Soft delete — mark as inactive instead of removing from DB
    // This preserves historical data (attendance, payslips, etc.)
    employee.isActive = false
    await employee.save()

    // Also deactivate the linked user account
    await User.findByIdAndUpdate(employee.user, { isActive: false })

    res.status(200).json({
      success: true,
      message: 'Employee deactivated successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
