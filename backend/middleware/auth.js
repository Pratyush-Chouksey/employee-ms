import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// ─────────────────────────────────────────────────────────
// protect — verifies JWT, attaches user to req
// Use this on any route that requires login
// ─────────────────────────────────────────────────────────
export const protect = async (req, res, next) => {
  try {
    // 1. Get token from cookie
    const token = req.cookies.token
    // cookieParser middleware (in server.js) makes this available
    // Browser automatically sends the cookie with every request

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, please log in',
      })
    }

    // 2. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // jwt.verify does two things:
    // a) Checks the signature — was this token created by us?
    // b) Checks expiry — is it still valid?
    // If either fails, it throws an error (caught below)
    // decoded = { id: '...', role: 'admin', iat: ..., exp: ... }

    // 3. Find the user from the ID inside the token
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists',
        // Token was valid but user was deleted from DB
      })
    }

    // 4. Attach user to request object
    req.user = user
    // Now every route handler after this can access req.user
    // Without needing to query the DB again

    next()
    // next() passes control to the next middleware or route handler

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
    })
  }
}

// ─────────────────────────────────────────────────────────
// restrictTo — limits access to specific roles
// Usage: restrictTo('admin') or restrictTo('admin', 'manager')
// ─────────────────────────────────────────────────────────
export const restrictTo = (...roles) => {
  // ...roles uses rest parameters — collects all arguments into an array
  // restrictTo('admin') → roles = ['admin']

  return (req, res, next) => {
    // Returns a middleware function
    // This is called a "closure" — it remembers the roles variable

    if (!roles.includes(req.user.role)) {
      // req.user was set by protect middleware above
      // If user's role is not in the allowed roles array → deny
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
        // 403 = Forbidden (vs 401 = Unauthorized)
        // 401: not logged in | 403: logged in but not allowed
      })
    }

    next()
    // Role is allowed — continue to route handler
  }
}