import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { authApi } from '../services/api';

interface AuthContextValue {
  token: string | null;
  role: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));
  const [role, setRole] = useState<string | null>(() => localStorage.getItem('authRole'));

  const login = async (username: string, password: string) => {
    const result = await authApi.login(username, password);
    localStorage.setItem('authToken', result.token);
    localStorage.setItem('authRole', result.role);
    setToken(result.token);
    setRole(result.role);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authRole');
    setToken(null);
    setRole(null);
  };

  const value = useMemo(
    () => ({ token, role, isAuthenticated: !!token, login, logout }),
    [token, role],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
