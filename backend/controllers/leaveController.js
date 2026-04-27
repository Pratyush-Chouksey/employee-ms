import Leave from '../models/Leave.js'
import Employee from '../models/Employee.js'

// ─────────────────────────────────────────────────────────
// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private (employee)
// ─────────────────────────────────────────────────────────
export const applyLeave = async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body

    // 1. Validate leave type
    const validTypes = ['Sick', 'Casual', 'Annual']
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Leave type must be one of: Sick, Casual, Annual',
      })
    }

    // 2. Find the employee profile linked to the logged-in user
    const employee = await Employee.findOne({ user: req.user._id })

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found',
      })
    }

    // 3. Check for overlapping leave requests
    // Two date ranges overlap when:
    // existing.start <= new.end AND existing.end >= new.start
    // Exclude rejected leaves — those shouldn't block new requests
    const overlapping = await Leave.findOne({
      employee: employee._id,
      status: { $ne: 'Rejected' },
      startDate: { $lte: new Date(endDate) },
      endDate: { $gte: new Date(startDate) },
    })

    if (overlapping) {
      return res.status(400).json({
        success: false,
        message: 'You already have a leave request for these dates',
      })
    }

    // 4. Create the leave request (status defaults to 'Pending')
    const leave = await Leave.create({
      employee: employee._id,
      type,
      startDate,
      endDate,
      reason,
    })

    res.status(201).json({
      success: true,
      leave,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ─────────────────────────────────────────────────────────
// @desc    Get my leave requests with summary
// @route   GET /api/leaves/my
// @access  Private (employee)
// ─────────────────────────────────────────────────────────
export const getMyLeaves = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id })

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found',
      })
    }

    // 1. Get all leaves for this employee, newest first
    const leaves = await Leave.find({ employee: employee._id })
      .sort({ createdAt: -1 })

    // 2. Calculate summary — count only APPROVED leaves per type
    const approvedLeaves = leaves.filter((l) => l.status === 'Approved')

    const summary = {
      Sick: approvedLeaves.filter((l) => l.type === 'Sick').length,
      Casual: approvedLeaves.filter((l) => l.type === 'Casual').length,
      Annual: approvedLeaves.filter((l) => l.type === 'Annual').length,
    }

    res.status(200).json({
      success: true,
      summary,
      leaves,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ─────────────────────────────────────────────────────────
// @desc    Get all leave requests (admin)
// @route   GET /api/leaves
// @access  Private/Admin
// ─────────────────────────────────────────────────────────
export const getAllLeaves = async (req, res) => {
  try {
    const filter = {}

    // Optional status filter: ?status=Pending
    if (req.query.status) {
      filter.status = req.query.status
    }

    const leaves = await Leave.find(filter)
      .populate('employee', 'name department position')
      // Pull in employee's name, department, and position
      .populate('reviewedBy', 'name')
      // Pull in the admin's name who reviewed the request
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: leaves.length,
      leaves,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ─────────────────────────────────────────────────────────
// @desc    Review (approve/reject) a leave request
// @route   PUT /api/leaves/:id/review
// @access  Private/Admin
// ─────────────────────────────────────────────────────────
export const reviewLeave = async (req, res) => {
  try {
    const { status } = req.body

    // 1. Validate status value
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either Approved or Rejected',
      })
    }

    // 2. Update the leave with review details
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status,
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).populate('employee', 'name department')

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found',
      })
    }

    res.status(200).json({
      success: true,
      leave,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
