import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Employee from '../models/Employee.js'

// ─── Helper: Create & Send JWT Cookie ──────────────────
// We'll reuse this in both login and register
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },

    process.env.JWT_SECRET,

    { expiresIn: '7d' }
  )

  const cookieOptions = {
    httpOnly: true,

    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),

    secure: process.env.NODE_ENV === 'production',

    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  }

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employee: user.employee,
      },
    })
}

// ─────────────────────────────────────────────────────────
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email })
    // findOne returns null if not found, or the user document if found
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      })
      // return early — stop function execution
    }

    // 2. Create the user
    // Password gets hashed automatically via our pre-save hook in User model
    const user = await User.create({ name, email, password, role })

    // 3. If role is employee, create their employee profile too
    if (user.role === 'employee') {
      const employee = await Employee.create({
        user: user._id,
        // Links the employee profile to this user account
        name: user.name,
        email: user.email,
        position: 'Not assigned',
        department: 'Not assigned',
        salary: 0,
      })

      // Link back: store employee ID on the user document
      user.employee = employee._id
      await user.save()
      // save() triggers pre-save hook — but password won't re-hash
      // because isModified('password') will be false
    }

    // 4. Send token + response
    sendTokenResponse(user, 201, res)
    // 201 = Created (vs 200 = OK)

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ─────────────────────────────────────────────────────────
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // 1. Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      })
    }

    // 2. Find user by email — explicitly include password
    // Remember: we set select: false on password in the schema
    // So we must manually ask for it here with .select('+password')
    const user = await User.findOne({ email }).select('+password')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        // Never say "email not found" — that gives hackers info
        // Always use a generic message for security
      })
    }

    // 3. Compare entered password with hashed password in DB
    const isMatch = await user.comparePassword(password)
    // This calls the instance method we defined in User model
    // bcrypt hashes the input and compares with stored hash

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    // 4. Send token
    sendTokenResponse(user, 200, res)

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ─────────────────────────────────────────────────────────
// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
// ─────────────────────────────────────────────────────────
export const logout = async (req, res) => {
  res
    .status(200)
    .cookie('token', 'none', {
      // Overwrite the token cookie with a dummy value 'none'
      httpOnly: true,
      expires: new Date(Date.now() + 5 * 1000),
      // Expires in 5 seconds — effectively deletes it immediately
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    })
    .json({
      success: true,
      message: 'Logged out successfully',
    })
}

// ─────────────────────────────────────────────────────────
// @desc    Get currently logged in user
// @route   GET /api/auth/me
// @access  Private
// ─────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    // req.user is set by our protect middleware (coming next)
    // We fetch fresh data from DB in case profile was updated
    const user = await User.findById(req.user.id).populate('employee')
    // .populate('employee') replaces the employee ObjectId
    // with the actual Employee document — like a SQL JOIN

    res.status(200).json({
      success: true,
      user,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ─────────────────────────────────────────────────────────
// @desc    Update logged-in user's name
// @route   PUT /api/auth/updateme
// @access  Private
// ─────────────────────────────────────────────────────────
export const updateMe = async (req, res) => {
  try {
    // Only allow updating the name field
    const fieldsToUpdate = { name: req.body.name }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
      // new: true  → return the updated document instead of the old one
      // runValidators: true → enforce schema validations on the update
    )

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employee: user.employee,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ─────────────────────────────────────────────────────────
// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
// ─────────────────────────────────────────────────────────
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    // 1. Validate newPassword minimum length
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      })
    }

    // 2. Get user with password field included
    // select: false on password means we must explicitly ask for it
    const user = await User.findById(req.user.id).select('+password')

    // 3. Verify current password
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      })
    }

    // 4. Set new password and save
    // The pre-save hook on User model will auto-hash the new password
    user.password = newPassword
    await user.save()

    // 5. Re-issue JWT cookie so the session stays valid
    sendTokenResponse(user, 200, res)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}