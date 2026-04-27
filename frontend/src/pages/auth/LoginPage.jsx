// ──────────────────────────────────────────────────
// LoginPage.jsx — Role-specific login form
// ──────────────────────────────────────────────────
// Reuses the same dark left panel as LandingPage.
// The right side shows a login form.
//
// The role (admin/employee) comes from the URL param
// via useParams(). This lets us use ONE component for
// both login flows — the only difference is the title
// and where we redirect after success.
//
// On successful login:
//   admin    → /admin/dashboard
//   employee → /employee/dashboard
// ──────────────────────────────────────────────────

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  // ── URL Param ───────────────────────────────────
  // /login/:role → role is "admin" or "employee"
  const { role } = useParams();
  const navigate = useNavigate();

  // Pull the login function from AuthContext.
  // login() returns the user object so we can check
  // the role for redirection.
  const { login } = useAuth();

  // ── Local State ─────────────────────────────────
  // form: controlled inputs for email and password.
  // showPassword: toggles password visibility.
  // loading: disables the button during the API call.
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── Input Handler ───────────────────────────────
  // Uses computed property keys so ONE handler works
  // for both email and password fields.
  // e.target.name is "email" or "password" (from the
  // name attribute on each input).
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ── Form Submit ─────────────────────────────────
  const handleSubmit = async (e) => {
    // Prevent the default browser form POST.
    e.preventDefault();
    setLoading(true);

    try {
      // Call the login function from AuthContext.
      // It POSTs to /auth/login and returns the user.
      const user = await login(form.email, form.password);

      // Show a welcome toast with the user's name.
      toast.success(`Welcome back, ${user.name}!`);

      // Redirect based on the user's actual role
      // (not the URL param — the server is the source
      // of truth for the role).
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (error) {
      // The backend sends { success: false, message: "..." }
      // on failure. Show that message, or a generic fallback.
      toast.error(
        error.response?.data?.message || 'Login failed'
      );
    } finally {
      // Re-enable the submit button whether success or fail.
      setLoading(false);
    }
  };

  // ── Capitalize Helper ───────────────────────────
  // Turns "admin" → "Admin" for the page title.
  const capitalizedRole = role
    ? role.charAt(0).toUpperCase() + role.slice(1)
    : '';

  return (
    // Same split-screen layout as LandingPage.
    <div className="flex min-h-screen">

      {/* ── LEFT HALF — Dark Branded Panel ───────── */}
      {/* Identical to LandingPage for visual consistency. */}
      <div className="w-1/2 bg-[#0f1221] relative overflow-hidden flex items-end">

        {/* Decorative gradient blob */}
        <div className="absolute w-80 h-80 bg-indigo-600/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 top-0 left-0" />

        {/* Brand text */}
        <div className="relative z-10 p-12">
          <h1 className="text-5xl font-bold text-white leading-tight mb-4">
            Employee<br />
            Management<br />
            System
          </h1>
          <p className="text-white/50 max-w-md">
            Streamline your workforce operations, track
            attendance, manage payroll, and empower your
            team securely.
          </p>
        </div>
      </div>

      {/* ── RIGHT HALF — Login Form ──────────────── */}
      <div className="w-1/2 bg-white flex items-center justify-center">
        <div className="max-w-sm w-full px-8">

          {/* Back link — returns to the portal selection.
              flex + items-center aligns the arrow with text. */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">Back to portals</span>
          </button>

          {/* Page title — shows which portal we're logging into */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {capitalizedRole} Portal
          </h2>

          {/* Subtitle */}
          <p className="text-gray-500 mb-8">
            Sign in to access your account
          </p>

          {/* ── Login Form ─────────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Password Field — with show/hide toggle */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Password
              </label>
              {/* relative wrapper so we can absolutely position
                  the eye icon inside the input. */}
              <div className="relative">
                <input
                  id="password"
                  // Toggle between text and password type
                  // based on showPassword state.
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  // pr-10 makes room for the eye icon so
                  // typed text doesn't overlap it.
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm pr-10"
                />
                {/* Eye toggle button — positioned inside the
                    input field on the right side. */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {/* Show EyeOff when password is visible,
                      Eye when it's hidden. This is the
                      industry-standard UX pattern. */}
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              // opacity-50 + cursor-not-allowed when disabled
              // gives clear feedback that the button is inactive.
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {/* Swap label while the API call is in flight */}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-12">
            © 2026 Pratyush. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
