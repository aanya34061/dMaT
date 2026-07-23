'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserAccount, UserPlan } from '../types/auth';

interface AuthContextType {
  user: UserAccount | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPro: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; avatarUrl?: string; bio?: string }) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  resetPassword: (email: string, code: string, newPass: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  upgradeSubscription: (plan: UserPlan) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: (password: string) => Promise<{ success: boolean; error?: string }>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('dmat_auth_token') : null;
      const headers: Record<string, string> = {};
      if (storedToken) {
        headers['Authorization'] = `Bearer ${storedToken}`;
      }

      const res = await fetch('/api/auth/me', { headers });
      const data = await res.json();

      if (data.authenticated && data.user) {
        setUser(data.user);
        if (storedToken) setToken(storedToken);
      } else {
        setUser(null);
        setToken(null);
        if (typeof window !== 'undefined') localStorage.removeItem('dmat_auth_token');
      }
    } catch (err) {
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        return { success: false, error: data.error || 'Sign in failed' };
      }

      setUser(data.user);
      setToken(data.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('dmat_auth_token', data.token);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const signup = async (name: string, email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        return { success: false, error: data.error || 'Sign up failed' };
      }

      setUser(data.user);
      setToken(data.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('dmat_auth_token', data.token);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (_) {}
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dmat_auth_token');
    }
  };

  const updateProfile = async (data: { name?: string; avatarUrl?: string; bio?: string }) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok || result.error) {
        return { success: false, error: result.error || 'Update failed' };
      }

      if (user) {
        setUser({
          ...user,
          name: data.name || user.name,
          avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : user.avatarUrl,
        });
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const changePassword = async (currentPass: string, newPass: string) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers,
        body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }),
      });
      const result = await res.json();

      if (!res.ok || result.error) {
        return { success: false, error: result.error || 'Failed to change password' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || data.error) return { success: false, error: data.error };
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const resetPassword = async (email: string, code: string, newPass: string) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetCode: code, newPassword: newPass }),
      });
      const data = await res.json();
      if (!res.ok || data.error) return { success: false, error: data.error };
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const upgradeSubscription = async (plan: UserPlan) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers,
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();

      if (!res.ok || data.error) return { success: false, error: data.error };

      if (user) {
        setUser({
          ...user,
          subscription: {
            ...user.subscription,
            plan,
            status: 'ACTIVE',
          },
        });
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const deleteAccount = async (password: string) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers,
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok || data.error) return { success: false, error: data.error };
      await logout();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'ADMIN',
        isPro: user?.subscription.plan === 'PRO',
        login,
        signup,
        logout,
        updateProfile,
        changePassword,
        forgotPassword,
        resetPassword,
        upgradeSubscription,
        deleteAccount,
        refreshUserData: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
