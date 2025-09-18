import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const TOKEN_KEY = 'monotours24_admin_token';
const USER_KEY = 'monotours24_admin_user';
const BRANDING_KEY = 'monotours24_admin_branding';

const AuthContext = createContext({
  token: null,
  user: null,
  branding: null,
  loading: false,
  error: null,
  login: async () => {},
  logout: () => {},
  setBranding: () => {}
});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [branding, setBranding] = useState(() => {
    const raw = localStorage.getItem(BRANDING_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let active = true;
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/admin/session', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Sitzung ungültig');
        }
        const data = await response.json();
        if (!active) return;
        setUser(data.user);
        setBranding(data.branding ?? null);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        localStorage.setItem(BRANDING_KEY, JSON.stringify(data.branding ?? null));
        setError(null);
      } catch (sessionError) {
        console.warn('Session check failed', sessionError);
        logout();
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchSession();
    return () => {
      active = false;
    };
  }, [token]);

  const login = async (email, password) => {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: 'Anmeldung fehlgeschlagen' }));
      throw new Error(errorBody.message || 'Anmeldung fehlgeschlagen');
    }
    const data = await response.json();
    setToken(data.token);
    setUser(data.user);
    setBranding(data.branding ?? null);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    localStorage.setItem(BRANDING_KEY, JSON.stringify(data.branding ?? null));
    setError(null);
    return data.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setBranding(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(BRANDING_KEY);
  };

  const value = useMemo(
    () => ({ token, user, branding, loading, error, login, logout, setBranding }),
    [token, user, branding, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
