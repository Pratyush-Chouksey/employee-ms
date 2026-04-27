// ──────────────────────────────────────────────────
// Modal.jsx — Reusable modal dialog wrapper
// ──────────────────────────────────────────────────
// A generic modal used across the app for:
//   - Adding/editing employees (admin)
//   - Generating payslips (admin)
//   - Applying for leave (employee)
//
// Props:
//   title    — string displayed in the header
//   onClose  — callback when the user clicks X or
//              clicks the overlay backdrop
//   children — the modal body content (form, text, etc.)
//   maxWidth — optional Tailwind max-width class,
//              defaults to "max-w-lg" (512px)
//
// The modal renders a fixed overlay that covers the
// entire screen, with the card centered on top.
// ──────────────────────────────────────────────────

import { X } from 'lucide-react';

const Modal = ({ title, onClose, children, maxWidth = 'max-w-lg' }) => {
  return (
    // ── Overlay ────────────────────────────────────
    // fixed inset-0 covers the entire viewport.
    // bg-black/50 is a 50% opacity black backdrop.
    // z-50 ensures the modal sits above everything.
    // p-4 prevents the card from touching screen edges
    // on small viewports.
    // Clicking the overlay itself closes the modal.
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      {/* ── Modal Card ──────────────────────────────
          stopPropagation prevents clicks INSIDE the card
          from bubbling up to the overlay's onClick handler.
          Without this, clicking any form field would
          close the modal. */}
      <div
        className={`bg-white rounded-2xl w-full ${maxWidth} p-6`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ──────────────────────────────── */}
        {/* Title on the left, close button on the right. */}
        <div className="flex items-center justify-between mb-6">
          {/* Modal title — bold and prominent */}
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>

          {/* Close button — the X icon from lucide.
              Hover darkens it for visual feedback.
              cursor-pointer is explicit for clarity. */}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Body ────────────────────────────────── */}
        {/* Whatever the parent passes as children
            (forms, confirmation text, etc.) renders here. */}
        {children}
      </div>
    </div>
  );
};

export default Modal;
