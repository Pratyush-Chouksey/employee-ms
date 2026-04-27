// ──────────────────────────────────────────────────
// main.jsx — Application entry point
// ──────────────────────────────────────────────────
// This is the very first file Vite executes.
// It does three things:
//   1. Imports global CSS (Tailwind base + our styles)
//   2. Mounts the React tree to the DOM
//   3. Wraps <App /> in StrictMode for dev warnings
// ──────────────────────────────────────────────────

// StrictMode enables extra development-time checks:
// - Warns about deprecated lifecycle methods
// - Detects unexpected side effects by double-invoking
//   certain functions (renders, effects, etc.)
// - Has ZERO impact in production builds
import { StrictMode } from 'react';

// createRoot is the React 18+ API for mounting.
// It enables concurrent features like automatic batching.
import { createRoot } from 'react-dom/client';

// Global stylesheet — this imports Tailwind's base,
// components, and utilities via the @import directive
// inside index.css.
import './index.css';

// The root component of our application.
// App.jsx will contain the router and all page routes.
import App from './App.jsx';

// Grab the <div id="root"> from index.html and mount
// our entire React application inside it.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
