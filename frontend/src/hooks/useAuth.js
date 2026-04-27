// ──────────────────────────────────────────────────
// useAuth.js — Custom hook to consume AuthContext
// ──────────────────────────────────────────────────
// WHY a custom hook instead of raw useContext?
//
//   1. Cleaner imports — components just write:
//        import { useAuth } from '../hooks/useAuth';
//      instead of importing both useContext AND AuthContext.
//
//   2. Safety — if someone accidentally uses this
//      hook outside of <AuthProvider>, they get a
//      clear error message instead of a cryptic
//      "cannot read property of null" crash.
// ──────────────────────────────────────────────────

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  // Pull the value that AuthProvider is passing down.
  const context = useContext(AuthContext);

  // Guard: if context is null, the hook was called
  // outside <AuthProvider>. This should never happen
  // in production, but catches wiring mistakes fast.
  if (!context) {
    throw new Error(
      'useAuth must be used within an <AuthProvider>. ' +
      'Wrap your component tree with <AuthProvider> in main.jsx.'
    );
  }

  // Return the full context object:
  // { user, setUser, loading, login, logout, isAdmin, isEmployee }
  return context;
};
