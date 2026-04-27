// ──────────────────────────────────────────────────
// axios.js — Pre-configured Axios instance
// ──────────────────────────────────────────────────
// Every API call in the app will use THIS instance
// instead of the raw axios import. This guarantees
// two things are always set:
//   1. baseURL  → all requests hit the backend
//   2. withCredentials → the browser sends/receives
//      the HttpOnly auth cookie automatically
//
// The baseURL is read from a Vite environment variable
// so it works in both local dev and production:
//   - Local:  VITE_API_URL=http://localhost:3000/api
//   - Prod:   VITE_API_URL=https://your-backend.onrender.com/api
// ──────────────────────────────────────────────────

import axios from 'axios';

// Create a custom Axios instance with project defaults.
// This avoids repeating config on every single request.
const api = axios.create({
  // import.meta.env.VITE_API_URL is injected at build time
  // by Vite. Falls back to localhost for dev convenience.
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',

  // CRITICAL — without this, the browser will NOT
  // attach the HttpOnly cookie to cross-origin requests.
  // Our auth system breaks completely if this is false.
  withCredentials: true,
});

// Export as the default so consumers simply write:
//   import api from '../api/axios';
//   api.get('/auth/me');
export default api;
