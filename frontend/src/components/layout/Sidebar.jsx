// ──────────────────────────────────────────────────
// Sidebar.jsx — Dark navigation sidebar
// ──────────────────────────────────────────────────
// Fixed-position sidebar with:
//   1. Brand header
//   2. User info card with initials avatar
//   3. Role-based navigation links
//   4. Logout button pinned to the bottom
//
// The sidebar is always visible on-screen (fixed).
// Layout.jsx offsets the main content with ml-64.
// ──────────────────────────────────────────────────

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../utils/helpers';

// Import every icon we need from lucide-react.
// Each icon is a React component that accepts size,
// strokeWidth, className, etc.
import toast from 'react-hot-toast';
import {
  UserCircle,
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  Settings,
  FileText,
  LogOut,
} from 'lucide-react';

const Sidebar = () => {
  // Pull user data, role flags, and logout function
  // from our auth context.
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  // ── Navigation Config ───────────────────────────
  // Define links as arrays so we can .map() over them.
  // Each entry has a label, route path, and icon component.
  // This keeps the JSX clean and makes adding links trivial.

  const adminLinks = [
    { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Employees', to: '/admin/employees', icon: Users },
    { label: 'Leave', to: '/admin/leave', icon: Calendar },
    { label: 'Payslips', to: '/admin/payslips', icon: DollarSign },
    { label: 'Settings', to: '/admin/settings', icon: Settings },
  ];

  const employeeLinks = [
    { label: 'Dashboard', to: '/employee/dashboard', icon: LayoutDashboard },
    { label: 'Attendance', to: '/employee/attendance', icon: Calendar },
    { label: 'Leave', to: '/employee/leave', icon: FileText },
    { label: 'Payslips', to: '/employee/payslips', icon: DollarSign },
    { label: 'Settings', to: '/employee/settings', icon: Settings },
  ];

  // Pick the correct link set based on the user's role.
  const navLinks = isAdmin ? adminLinks : employeeLinks;

  // ── Logout Handler ──────────────────────────────
  // Calls the context logout (clears cookie + state),
  // then redirects to the landing page.
  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    // Fixed sidebar — stays in place while main content scrolls.
    // w-64 = 256px wide. h-screen = full viewport height.
    // flex flex-col so we can push the logout to the bottom
    // with mt-auto.
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0f1221] flex flex-col z-40">

      {/* ── 1. Brand Section ─────────────────────── */}
      {/* The app logo/name at the top of the sidebar. */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          {/* UserCircle as a "logo" icon */}
          <UserCircle size={32} className="text-indigo-400" />
          <div>
            {/* Primary brand name */}
            <h1 className="text-white font-bold text-lg leading-tight">
              Employee MS
            </h1>
            {/* Subtitle — smaller and muted */}
            <p className="text-white/40 text-xs">
              Management System
            </p>
          </div>
        </div>
      </div>

      {/* ── 2. User Info Card ────────────────────── */}
      {/* Shows who is logged in with an initials avatar. */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
          {/* Avatar — rounded square with the user's initials.
              bg-indigo-500 gives it a branded color. */}
          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            {getInitials(user?.name)}
          </div>
          <div className="min-w-0">
            {/* User name — truncate prevents overflow on long names */}
            <p className="text-white text-sm font-medium truncate">
              {user?.name}
            </p>
            {/* Role label — capitalize first letter */}
            <p className="text-white/40 text-xs capitalize">
              {user?.role}
            </p>
          </div>
        </div>
      </div>

      {/* ── 3. Navigation Links ──────────────────── */}
      {/* flex-1 makes this section grow to fill available
          space, pushing the logout button to the bottom. */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {/* Section label */}
        <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider px-4 pt-2 pb-1">
          Navigation
        </p>
        {navLinks.map(({ label, to, icon: Icon }) => (
          // NavLink gives us the isActive callback, which
          // tells us if the current URL matches this link's `to`.
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              // Base styles shared by active and inactive states.
              'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ' +
              (isActive
                // Active: solid indigo background, white text
                ? 'bg-indigo-600 text-white'
                // Inactive: transparent, muted text, hover brightens
                : 'text-white/60 hover:text-white hover:bg-white/10')
            }
          >
            {/* The icon component rendered dynamically.
                We destructured it as `Icon` (capital I)
                so React treats it as a component. */}
            <Icon size={20} strokeWidth={1.5} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* ── 4. Logout Button ─────────────────────── */}
      {/* Pinned to the bottom via the flex layout above.
          border-t separates it from the nav visually. */}
      <div className="px-4 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors w-full cursor-pointer"
        >
          <LogOut size={20} strokeWidth={1.5} />
          Log out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
