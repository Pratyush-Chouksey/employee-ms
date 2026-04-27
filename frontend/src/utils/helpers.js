// ──────────────────────────────────────────────────
// helpers.js — Pure utility functions
// ──────────────────────────────────────────────────
// These are stateless formatting helpers used across
// the app. Keeping them here avoids duplicating the
// same logic in multiple components.
// ──────────────────────────────────────────────────

/**
 * formatDate — Convert an ISO date string to a
 * human-friendly short date.
 *
 * Example: "2026-03-27T10:00:00Z" → "Mar 27, 2026"
 *
 * @param {string} dateStr - ISO 8601 date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateStr) => {
  // Create a Date object from the ISO string.
  // toLocaleDateString formats it according to the
  // user's locale with our chosen options.
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',   // "Mar" instead of "March"
    day: 'numeric',   // "27" (no leading zero)
    year: 'numeric',  // "2026"
  });
};

/**
 * formatTime — Convert an ISO date string to a
 * 12-hour time format.
 *
 * Example: "2026-03-27T10:30:00Z" → "10:30 AM"
 * If no dateStr is provided, returns "—" (em dash)
 * to indicate missing data (e.g., employee hasn't
 * clocked out yet).
 *
 * @param {string|null|undefined} dateStr - ISO 8601 date string
 * @returns {string} Formatted time or em dash
 */
export const formatTime = (dateStr) => {
  // Guard: return a dash for null/undefined/empty values.
  // This is common in attendance records where clockOut
  // hasn't happened yet.
  if (!dateStr) return '—';

  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit',    // "10" (with leading zero)
    minute: '2-digit',  // "30"
    hour12: true,       // "AM/PM" instead of 24-hour
  });
};

/**
 * formatCurrency — Format a number as USD currency.
 *
 * Example: 2000 → "$2,000"
 * Uses toLocaleString for proper comma separation.
 *
 * @param {number} amount - Dollar amount
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  // toLocaleString adds commas for thousands.
  // We prepend the $ sign manually for simplicity.
  return `$${amount.toLocaleString()}`;
};

/**
 * getInitials — Extract first letters of each word
 * in a name for avatar placeholders.
 *
 * Example: "John Doe" → "JD"
 *          "Alice"    → "A"
 *          undefined  → ""
 *
 * @param {string|undefined} name - Full name
 * @returns {string} Uppercase initials
 */
export const getInitials = (name) => {
  // Guard: if name is falsy (undefined, null, ""),
  // return empty string to avoid a crash.
  if (!name) return '';

  return name
    .split(' ')           // ["John", "Doe"]
    .map((n) => n[0])     // ["J", "D"]
    .join('')              // "JD"
    .toUpperCase();        // ensure uppercase
};

/**
 * getMonthName — Convert a 1-based month number to
 * its full English name.
 *
 * Example: 1 → "January", 12 → "December"
 *
 * The array has an empty string at index 0 so that
 * month numbers (1–12) can be used directly as indices
 * without subtracting 1.
 *
 * @param {number} monthNumber - Month (1–12)
 * @returns {string} Full month name
 */
export const getMonthName = (monthNumber) => {
  // Index 0 is a placeholder so that months[1] = "January".
  const months = [
    '',          // 0  — unused placeholder
    'January',   // 1
    'February',  // 2
    'March',     // 3
    'April',     // 4
    'May',       // 5
    'June',      // 6
    'July',      // 7
    'August',    // 8
    'September', // 9
    'October',   // 10
    'November',  // 11
    'December',  // 12
  ];

  // Return the month name at the given index.
  return months[monthNumber];
};
