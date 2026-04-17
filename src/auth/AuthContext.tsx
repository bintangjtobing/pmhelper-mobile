import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as api from '../api/endpoints';
import { clearToken, getToken, setToken, setUnauthorizedHandler } from '../api/client';
import type { User } from '../types/api';

type AuthState =
  | { status: 'loading'; user: null }
  | { status: 'authenticated'; user: User }
  | { status: 'unauthenticated'; user: null };

type AuthContextValue = {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading', user: null });

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // ignore — token may already be gone
    }
    await clearToken();
    setState({ status: 'unauthenticated', user: null });
  }, []);

  const refresh = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      setState({ status: 'unauthenticated', user: null });
      return;
    }
    try {
      const user = await api.me();
      setState({ status: 'authenticated', user });
    } catch {
      await clearToken();
      setState({ status: 'unauthenticated', user: null });
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await api.login(email, password, 'PMHelper Mobile');
    await setToken(token);
    setState({ status: 'authenticated', user });
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearToken().then(() => setState({ status: 'unauthenticated', user: null }));
    });
    refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ state, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
