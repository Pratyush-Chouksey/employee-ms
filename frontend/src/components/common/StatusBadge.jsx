// ──────────────────────────────────────────────────
// StatusBadge.jsx — Colored pill badge for statuses
// ──────────────────────────────────────────────────
// Renders a small pill-shaped badge whose color
// reflects the status. Used in:
//   - Leave tables (Approved / Rejected / Pending)
//   - Attendance tables (Present / Late / Absent)
//
// Props:
//   status — string like "Approved", "PENDING", etc.
//
// The component normalizes the status to uppercase
// for the color lookup, so it works regardless of
// the casing the backend sends.
// ──────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  // ── Color Map ───────────────────────────────────
  // Maps uppercase status strings to Tailwind classes.
  // Green = positive, Red = negative, Yellow = pending.
  // A gray default handles any unexpected status values
  // gracefully instead of crashing.
  const colorMap = {
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
  };

  // Normalize to uppercase so "Approved", "approved",
  // and "APPROVED" all match the same entry.
  const upperStatus = status?.toUpperCase() || '';

  // Look up the color classes, fall back to gray.
  const colorClasses = colorMap[upperStatus] || 'bg-gray-100 text-gray-600';

  return (
    // Pill shape: rounded-full + horizontal padding.
    // text-xs + font-semibold keeps it compact but readable.
    // uppercase ensures consistent visual presentation.
    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${colorClasses}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
