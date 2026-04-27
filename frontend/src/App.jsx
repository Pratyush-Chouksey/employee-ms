// ──────────────────────────────────────────────────
// App.jsx — Root component & route definitions
// ──────────────────────────────────────────────────
// This is the central routing hub of the application.
// It defines EVERY route, wraps the tree in providers,
// and enforces role-based access via ProtectedRoute.
//
// Provider order (outermost → innermost):
//   BrowserRouter → AuthProvider → Routes
//
// Toaster is a sibling to Routes (not a wrapper),
// so toast notifications render on top of any page.
// ──────────────────────────────────────────────────

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/layout/Layout';

// ── Auth Pages (public) ──────────────────────────
import LandingPage from './pages/auth/LandingPage';
import LoginPage from './pages/auth/LoginPage';

// ── Admin Pages ──────────────────────────────────
import AdminDashboard from './pages/admin/Dashboard';
import AdminEmployees from './pages/admin/Employees';
import AdminLeaveMgmt from './pages/admin/LeaveMgmt';
import AdminPayslips from './pages/admin/Payslips';
import AdminSettings from './pages/admin/Settings';

// ── Employee Pages ───────────────────────────────
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeAttendance from './pages/employee/Attendance';
import EmployeeLeave from './pages/employee/Leave';
import EmployeePayslips from './pages/employee/Payslips';
// Settings is shared — employee/Settings.jsx re-exports
// admin/Settings.jsx to avoid code duplication.
import EmployeeSettings from './pages/employee/Settings';

const App = () => {
  return (
    // BrowserRouter enables client-side routing.
    // Must be the outermost wrapper so useNavigate,
    // NavLink, etc. work everywhere in the tree.
    <BrowserRouter>
      {/* AuthProvider makes user/login/logout available
          to every component via useAuth(). Must be inside
          BrowserRouter because logout() calls navigate(). */}
      <AuthProvider>

        {/* Toaster renders toast notifications globally.
            position="top-right" matches common UX patterns.
            It's a sibling to Routes, not wrapping it. */}
        <Toaster position="top-right" />

        <Routes>
          {/* ── Public Routes ──────────────────────── */}
          {/* These are accessible without authentication.
              No ProtectedRoute wrapper needed. */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login/:role" element={<LoginPage />} />

          {/* ── Admin Routes ───────────────────────── */}
          {/* Every admin route is wrapped in:
              1. ProtectedRoute (allowedRole="admin")
                 → redirects if not logged in or not admin
              2. Layout → provides the sidebar + content area
              
              Each route renders its page component as
              the children of Layout. */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRole="admin">
                <Layout><AdminDashboard /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/employees"
            element={
              <ProtectedRoute allowedRole="admin">
                <Layout><AdminEmployees /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/leave"
            element={
              <ProtectedRoute allowedRole="admin">
                <Layout><AdminLeaveMgmt /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payslips"
            element={
              <ProtectedRoute allowedRole="admin">
                <Layout><AdminPayslips /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRole="admin">
                <Layout><AdminSettings /></Layout>
              </ProtectedRoute>
            }
          />

          {/* ── Employee Routes ────────────────────── */}
          {/* Same pattern as admin routes, but with
              allowedRole="employee". */}
          <Route
            path="/employee/dashboard"
            element={
              <ProtectedRoute allowedRole="employee">
                <Layout><EmployeeDashboard /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/attendance"
            element={
              <ProtectedRoute allowedRole="employee">
                <Layout><EmployeeAttendance /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/leave"
            element={
              <ProtectedRoute allowedRole="employee">
                <Layout><EmployeeLeave /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/payslips"
            element={
              <ProtectedRoute allowedRole="employee">
                <Layout><EmployeePayslips /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/settings"
            element={
              <ProtectedRoute allowedRole="employee">
                <Layout><EmployeeSettings /></Layout>
              </ProtectedRoute>
            }
          />

          {/* ── Catch-All ──────────────────────────── */}
          {/* Any unmatched URL redirects to the landing page.
              replace prevents the bad URL from entering
              browser history. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;