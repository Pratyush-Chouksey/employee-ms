// ──────────────────────────────────────────────────
// employee/Settings.jsx — Re-export of admin Settings
// ──────────────────────────────────────────────────
// Both admin and employee settings pages have the
// exact same functionality:
//   - Update display name
//   - Change password
//
// Instead of duplicating the component, we re-export
// the admin version. This way:
//   1. There's only ONE source of truth for the code
//   2. Bug fixes apply to both roles automatically
//   3. The import in App.jsx still works naturally
//      (import EmployeeSettings from './pages/employee/Settings')
// ──────────────────────────────────────────────────

export { default } from '../admin/Settings.jsx';
