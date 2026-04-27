import Attendance from '../models/Attendance.js'
import Employee from '../models/Employee.js'

// ─────────────────────────────────────────────────────────
// @desc    Clock in for today
// @route   POST /api/attendance/clockin
// @access  Private (employee)
// ─────────────────────────────────────────────────────────
export const clockIn = async (req, res) => {
  try {
    // 1. Find the employee profile linked to the logged-in user
    const employee = await Employee.findOne({ user: req.user._id })

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found',
      })
    }

    // 2. Get today's date at midnight (strips the time portion)
    // This is used as the "date" key so we can have one record per day
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    // e.g. 2026-04-27T00:00:00.000Z

    // 3. Check if an attendance record already exists for today
    const existingRecord = await Attendance.findOne({
      employee: employee._id,
      date: today,
    })

    if (existingRecord) {
      if (existingRecord.checkOut) {
        // Already clocked in AND out — shift is done
        return res.status(400).json({
          success: false,
          message: 'You have already completed your shift today',
        })
      }
      // Clocked in but hasn't clocked out yet
      return res.status(400).json({
        success: false,
        message: 'You are already clocked in',
      })
    }

    // 4. Determine if the employee is late
    // Late = checking in after 9:30 AM
    const now = new Date()
    const lateThreshold = new Date()
    lateThreshold.setHours(9, 30, 0, 0)
    // Sets threshold to 9:30 AM today

    const isLate = now > lateThreshold

    // 5. Create attendance record
    const attendance = await Attendance.create({
      employee: employee._id,
      date: today,
      checkIn: now,
      isLate,
      status: 'Present',
    })

    res.status(201).json({
      success: true,
      attendance,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ─────────────────────────────────────────────────────────
// @desc    Clock out for today
// @route   PUT /api/attendance/clockout
// @access  Private (employee)
// ─────────────────────────────────────────────────────────
export const clockOut = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id })

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found',
      })
    }

    // 1. Get today's date at midnight
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 2. Find today's attendance record
    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: today,
    })

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'You have not clocked in today',
      })
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'You have already clocked out today',
      })
    }

    // 3. Set checkOut time and calculate working hours
    const now = new Date()
    attendance.checkOut = now

    // Calculate difference in hours (milliseconds → hours)
    const diffMs = now - attendance.checkIn
    const hours = diffMs / (1000 * 60 * 60)
    attendance.workingHours = Math.round(hours * 100) / 100
    // Round to 2 decimal places: 8.3333 → 8.33

    // 4. Determine day type based on working hours
    attendance.dayType = attendance.workingHours >= 4 ? 'Full Day' : 'Half Day'

    await attendance.save()

    res.status(200).json({
      success: true,
      attendance,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ─────────────────────────────────────────────────────────
// @desc    Get my attendance records with stats
// @route   GET /api/attendance/my
// @access  Private (employee)
// ─────────────────────────────────────────────────────────
export const getMyAttendance = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id })

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found',
      })
    }

    // 1. Get all attendance records, newest first
    const records = await Attendance.find({ employee: employee._id })
      .sort({ date: -1 })

    // 2. Calculate stats from the records
    const totalPresent = records.length
    const lateArrivals = records.filter((r) => r.isLate).length

    // Average working hours (only count records that have workingHours > 0)
    const recordsWithHours = records.filter((r) => r.workingHours > 0)
    const avgWorkHours =
      recordsWithHours.length > 0
        ? Math.round(
            (recordsWithHours.reduce((sum, r) => sum + r.workingHours, 0) /
              recordsWithHours.length) *
              10
          ) / 10
        : 0
    // Round to 1 decimal place: 7.666 → 7.7

    res.status(200).json({
      success: true,
      stats: {
        totalPresent,
        lateArrivals,
        avgWorkHours,
      },
      records,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ─────────────────────────────────────────────────────────
// @desc    Get all attendance records (admin)
// @route   GET /api/attendance
// @access  Private/Admin
// ─────────────────────────────────────────────────────────
export const getAllAttendance = async (req, res) => {
  try {
    const filter = {}

    // Optional date filter: ?date=2026-04-24
    if (req.query.date) {
      const startOfDay = new Date(req.query.date)
      startOfDay.setHours(0, 0, 0, 0)

      const endOfDay = new Date(req.query.date)
      endOfDay.setHours(23, 59, 59, 999)

      filter.date = { $gte: startOfDay, $lte: endOfDay }
      // $gte = greater than or equal, $lte = less than or equal
      // This captures all records within that calendar day
    }

    const records = await Attendance.find(filter)
      .populate('employee', 'name employeeId department')
      // Pull in employee name, ID badge number, and department
      .sort({ date: -1 })

    res.status(200).json({
      success: true,
      count: records.length,
      records,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
