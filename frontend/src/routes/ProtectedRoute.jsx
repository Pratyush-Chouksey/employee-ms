// ──────────────────────────────────────────────────
// ProtectedRoute.jsx — Route guard component
// ──────────────────────────────────────────────────
// Wraps any route that requires authentication.
// Optionally restricts to a specific role.
//
// Usage in App.jsx:
//   <Route element={<ProtectedRoute allowedRole="admin">
//     <AdminDashboard />
//   </ProtectedRoute>} />
// ──────────────────────────────────────────────────

import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, allowedRole }) => {
  // Pull auth state from context.
  const { user, loading } = useAuth();

  // ── CASE 1: Still checking the cookie ─────────
  // Show a centered spinner while we wait for
  // GET /auth/me to resolve. This prevents a flash
  // of the login page before the session is confirmed.
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        {/* Tailwind spinner: a spinning circle made
            with borders. The top border is transparent
            to create the "gap" in the ring. */}
        <div className="border-4 border-indigo-600 border-t-transparent rounded-full w-8 h-8 animate-spin" />
      </div>
    );
  }

  // ── CASE 2: No user → not logged in ───────────
  // Redirect to the landing page. `replace` prevents
  // the protected URL from appearing in browser history,
  // so the back button won't loop the user back here.
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // ── CASE 3: Wrong role ────────────────────────
  // If a route specifies allowedRole="admin" but the
  // logged-in user is an employee (or vice versa),
  // bounce them back to the landing page.
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  // ── CASE 4: All checks passed ─────────────────
  // Render the wrapped route content.
  return children;
};

export default ProtectedRoute;
