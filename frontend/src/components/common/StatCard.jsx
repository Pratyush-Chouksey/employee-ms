// ──────────────────────────────────────────────────
// StatCard.jsx — Reusable dashboard stat card
// ──────────────────────────────────────────────────
// Used on BOTH the admin and employee dashboards
// to display key metrics (total employees, days
// present, pending leaves, etc.).
//
// Props:
//   title  — label text, e.g. "Total Employees"
//   value  — the number/stat to display, e.g. 42
//   icon   — a lucide-react icon COMPONENT (not element)
//            e.g. pass {Users} not {<Users />}
//
// The icon is rendered large and light-gray on the
// right side to create a subtle visual anchor without
// competing with the value for attention.
// ──────────────────────────────────────────────────

const StatCard = ({ title, value, icon: Icon }) => {
  return (
    // White card with a thin border for definition.
    // rounded-xl for modern, soft corners.
    // p-6 for comfortable internal spacing.
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      {/* Horizontal layout: text on left, icon on right.
          items-center vertically centers both sides. */}
      <div className="flex items-center justify-between">

        {/* Left side — label + value stacked vertically */}
        <div>
          {/* Title: small, muted, describes the metric */}
          <p className="text-sm text-gray-500">{title}</p>
          {/* Value: large and bold, the focal point of the card */}
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>

        {/* Right side — the icon as a decorative element.
            size=36 makes it large enough to balance the
            bold value text on the left.
            text-gray-300 keeps it subtle/background.
            strokeWidth=1.5 for a thinner, elegant look. */}
        {Icon && <Icon size={36} className="text-gray-300" strokeWidth={1.5} />}
      </div>
    </div>
  );
};

export default StatCard;
