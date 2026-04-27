import Payslip from '../models/Payslip.js'
import Employee from '../models/Employee.js'

// ─────────────────────────────────────────────────────────
// @desc    Generate a payslip for an employee
// @route   POST /api/payslips
// @access  Private/Admin
// ─────────────────────────────────────────────────────────
export const generatePayslip = async (req, res) => {
  try {
    const {
      employeeId,
      month,
      year,
      allowances = 0,
      deductions = 0,
    } = req.body
    // Default allowances and deductions to 0 if not provided

    // 1. Find the employee
    const employee = await Employee.findById(employeeId)

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      })
    }

    // 2. Check if a payslip already exists for this employee + period
    // Use dot notation to query nested fields in the period object
    const existingPayslip = await Payslip.findOne({
      employee: employeeId,
      'period.month': month,
      'period.year': year,
    })

    if (existingPayslip) {
      return res.status(400).json({
        success: false,
        message: 'Payslip for this period already exists',
      })
    }

    // 3. Calculate net salary
    const netSalary = employee.salary + allowances - deductions

    // 4. Create the payslip
    const payslip = await Payslip.create({
      employee: employeeId,
      period: { month, year },
      basicSalary: employee.salary,
      allowances,
      deductions,
      netSalary,
      generatedBy: req.user._id,
    })

    // 5. Return populated payslip
    const populatedPayslip = await Payslip.findById(payslip._id)
      .populate('employee', 'name department position')
      .populate('generatedBy', 'name')

    res.status(201).json({
      success: true,
      payslip: populatedPayslip,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ─────────────────────────────────────────────────────────
// @desc    Get all payslips (admin)
// @route   GET /api/payslips
// @access  Private/Admin
// ─────────────────────────────────────────────────────────
export const getAllPayslips = async (req, res) => {
  try {
    const payslips = await Payslip.find()
      .populate('employee', 'name department position')
      .populate('generatedBy', 'name')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: payslips.length,
      payslips,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ─────────────────────────────────────────────────────────
// @desc    Get my payslips (employee)
// @route   GET /api/payslips/my
// @access  Private (employee)
// ─────────────────────────────────────────────────────────
export const getMyPayslips = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id })

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found',
      })
    }

    // Sort by year descending, then month descending
    // So the most recent payslip appears first
    const payslips = await Payslip.find({ employee: employee._id })
      .sort({ 'period.year': -1, 'period.month': -1 })

    res.status(200).json({
      success: true,
      payslips,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
