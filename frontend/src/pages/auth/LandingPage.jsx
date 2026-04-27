// ──────────────────────────────────────────────────
// LandingPage.jsx — Split-screen portal selection
// ──────────────────────────────────────────────────
// The first page users see. No auth required.
// Left half: dark branded panel with decorative blob.
// Right half: portal selection cards (Admin / Employee).
//
// This page does NOT handle login — it just routes
// the user to the correct LoginPage with the role
// baked into the URL (/login/admin or /login/employee).
// ──────────────────────────────────────────────────

import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  // ── Portal Config ───────────────────────────────
  // Array of portal options so we can .map() them.
  // Adding a new role is just one object here.
  const portals = [
    { label: 'Admin Portal', path: '/login/admin' },
    { label: 'Employee Portal', path: '/login/employee' },
  ];

  return (
    // Full-screen split layout: two equal halves side by side.
    // min-h-screen ensures it fills the viewport vertically.
    <div className="flex min-h-screen">

      {/* ── LEFT HALF — Dark Branded Panel ───────── */}
      {/* relative + overflow-hidden contain the decorative
          blob so it doesn't cause horizontal scroll. */}
      <div className="w-1/2 bg-[#0f1221] relative overflow-hidden flex items-end">

        {/* Decorative gradient blob — purely aesthetic.
            absolute positioning places it at the top-left
            corner. blur-3xl makes it a soft glow.
            The negative translate pulls it partially
            off-screen for a "peeking" effect. */}
        <div className="absolute w-80 h-80 bg-indigo-600/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 top-0 left-0" />

        {/* Text content — pinned to the bottom-left.
            z-10 ensures it renders above the blob.
            p-12 gives breathing room from edges. */}
        <div className="relative z-10 p-12">
          {/* Hero title — large, bold, multi-line.
              leading-tight tightens line spacing so
              the three words feel like one block. */}
          <h1 className="text-5xl font-bold text-white leading-tight mb-4">
            Employee<br />
            Management<br />
            System
          </h1>

          {/* Subtitle — muted white for visual hierarchy.
              max-w-md prevents it from stretching too wide. */}
          <p className="text-white/50 max-w-md">
            Streamline your workforce operations, track
            attendance, manage payroll, and empower your
            team securely.
          </p>
        </div>
      </div>

      {/* ── RIGHT HALF — Portal Selection ────────── */}
      {/* White background, content centered both axes. */}
      <div className="w-1/2 bg-white flex items-center justify-center">

        {/* Constrain width so the cards don't stretch
            across the entire half. max-w-sm = 384px. */}
        <div className="max-w-sm w-full px-8">

          {/* Heading */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h2>

          {/* Subtitle — guides the user on what to do */}
          <p className="text-gray-500 mb-8">
            Select your portal to securely access the system.
          </p>

          {/* Portal cards — one for each role */}
          <div className="space-y-4">
            {portals.map(({ label, path }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="w-full border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors cursor-pointer group"
              >
                {/* Portal label */}
                <span className="text-gray-700 font-medium">{label}</span>

                {/* Chevron arrow — nudges right on hover
                    via the group-hover utility for a subtle
                    interactive cue. */}
                <ChevronRight
                  size={20}
                  className="text-gray-400 group-hover:text-indigo-500 transition-colors"
                />
              </button>
            ))}
          </div>

          {/* Footer — copyright notice pinned to the
              bottom of the card area. mt-12 pushes it
              down from the portal cards. */}
          <p className="text-center text-xs text-gray-400 mt-12">
            © 2026 Pratyush. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
