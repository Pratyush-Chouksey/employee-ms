// ──────────────────────────────────────────────────
// AuthContext.jsx — Global authentication state
// ──────────────────────────────────────────────────
// This file does THREE things:
//   1. Creates a React Context to hold the auth state
//   2. Provides an AuthProvider that wraps the app
//   3. On mount, tries to restore the user session
//      by calling GET /auth/me (cookie-based)
// ──────────────────────────────────────────────────

import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/axios';

// 1. Create the context object.
//    Any component can read from this via useContext(AuthContext).
export const AuthContext = createContext(null);

// 2. AuthProvider — wrap <App /> with this so every
//    component in the tree can access auth state.
export const AuthProvider = ({ children }) => {
  // ── State ─────────────────────────────────────
  // user  → null means "not logged in"
  // loading → true while we're checking the cookie
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Session Restoration ───────────────────────
  // On first render, ask the backend "who am I?"
  // The browser automatically sends the HttpOnly
  // cookie (because withCredentials is true in our
  // Axios instance). If the cookie is valid, the
  // server returns the full user object.
  //
  // useCallback prevents this function from being
  // recreated on every render, which would cause
  // the useEffect below to loop infinitely.
  const checkAuth = useCallback(async () => {
    try {
      // Hit the /auth/me endpoint.
      const { data } = await api.get('/auth/me');

      // If the server says success, store the user.
      if (data.success) {
        setUser(data.user);
      }
    } catch {
      // 401 or network error → no valid session.
      // This is expected for unauthenticated visitors,
      // so we silently set user to null.
      setUser(null);
    } finally {
      // Whether success or failure, we're done loading.
      // Components can now safely check `user`.
      setLoading(false);
    }
  }, []);

  // Run checkAuth exactly once when the provider mounts.
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ── Login ─────────────────────────────────────
  // Sends credentials to the server. On success the
  // server sets an HttpOnly cookie AND returns the
  // user object. However the login response does NOT
  // populate the employee field (it's just an ObjectId).
  // So we immediately call /auth/me to get the fully
  // populated user with employee.position, department, etc.
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    // data.user has { _id, name, email, role, employee: "ObjectId" }
    // We need the role for redirect, so capture it first.
    const loginUser = data.user;

    // Now fetch the fully populated user from /auth/me
    // (the cookie was just set by the login response).
    try {
      const { data: meData } = await api.get('/auth/me');
      if (meData.success) {
        setUser(meData.user); // has populated employee object
      } else {
        setUser(loginUser); // fallback to unpopulated
      }
    } catch {
      setUser(loginUser); // fallback to unpopulated
    }

    return loginUser; // caller uses role to redirect
  };

  // ── Logout ────────────────────────────────────
  // Tells the server to clear the HttpOnly cookie,
  // then wipes local state so the UI reacts instantly.
  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  // ── Computed Booleans ─────────────────────────
  // Convenience flags so components can write
  //   if (isAdmin) { ... }
  // instead of checking user.role every time.
  // useMemo avoids recomputing on unrelated renders.
  const isAdmin = useMemo(() => user?.role === 'admin', [user]);
  const isEmployee = useMemo(() => user?.role === 'employee', [user]);

  // ── Context Value ─────────────────────────────
  // useMemo ensures the object reference stays stable
  // unless one of its dependencies actually changes.
  // Without this, every render would create a new
  // object → every consumer would re-render.
  const value = useMemo(
    () => ({ user, setUser, loading, login, logout, isAdmin, isEmployee }),
    [user, loading, isAdmin, isEmployee]
  );

  // Render the provider, passing our value down to
  // every nested component that calls useAuth().
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
