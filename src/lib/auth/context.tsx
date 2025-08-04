'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { sso, setAuthToken } from './sso';
import { authEvents } from './auth-events';
import { type CognitoTokens, getStoredTokens, clearTokens as clearCognitoTokens } from './cognito';

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  setCognitoAuth: (tokens: CognitoTokens) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      // First check for Cognito tokens
      const cognitoTokens = getStoredTokens();
      if (cognitoTokens) {
        // Use Cognito access token with SSO SDK
        setAuthToken(cognitoTokens.accessToken);
        const response = await sso.request('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.data.user);
          // Set cookie for middleware
          document.cookie = `timeback_token=${cognitoTokens.accessToken}; path=/; max-age=86400`;
          return;
        } else if (response.status === 401) {
          // Token might be expired, will be handled by auth-fetch with refresh
          console.log('Auth check failed with 401, token might be expired');
          setUser(null);
          document.cookie = 'timeback_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          return;
        }
      }
      
      // Fallback to SSO SDK token check
      const token = sso.getToken();
      if (token) {
        const response = await sso.request('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.data.user);
          // Set cookie for middleware
          document.cookie = `timeback_token=${token}; path=/; max-age=86400`;
        } else {
          // Token is invalid or expired
          console.log('Auth check failed, clearing token. Status:', response.status);
          setUser(null);
          sso.clearToken();
          document.cookie = 'timeback_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          
          // If we get a 401, don't try SSO check, just stay logged out
          if (response.status === 401) {
            return;
          }
        }
      } else {
        // Check for SSO session
        const result = await sso.checkSession();
        if (result.authenticated && result.user) {
          setUser(result.user);
          if (result.token) {
            document.cookie = `timeback_token=${result.token}; path=/; max-age=86400`;
          }
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      sso.clearToken();
      clearCognitoTokens();
      document.cookie = 'timeback_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await sso.login(email, password);
      if (result.success && result.user) {
        setUser(result.user);
        // Set cookie for middleware
        if (result.token) {
          document.cookie = `timeback_token=${result.token}; path=/; max-age=86400`;
        }
        return { success: true };
      }
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const setCognitoAuth = async (tokens: CognitoTokens) => {
    try {
      // Set the token in SSO SDK
      setAuthToken(tokens.accessToken);
      
      // Try to get user info
      const response = await sso.request('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.data.user);
        // Set cookie for middleware
        document.cookie = `timeback_token=${tokens.accessToken}; path=/; max-age=86400`;
      } else {
        throw new Error('Failed to get user info');
      }
    } catch (error) {
      console.error('Failed to set Cognito auth:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await sso.logout();
      setUser(null);
      // Clear Cognito tokens
      clearCognitoTokens();
      // Clear cookie for middleware
      document.cookie = 'timeback_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    checkAuth();
    
    // Listen for logout events from other tabs/windows or 401 responses
    const unsubscribe = authEvents.onLogout(() => {
      setUser(null);
      setIsLoading(false);
    });
    
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        setCognitoAuth,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}