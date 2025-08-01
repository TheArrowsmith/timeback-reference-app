/**
 * Minimal TimeBack SSO SDK
 */

interface SSOConfig {
  apiBaseUrl: string;
  storageKey?: string;
  autoCheck?: boolean;
}

interface SSOUser {
  id: string;
  email: string;
  name?: string | null;
  role: string;
}

interface CheckSessionResult {
  authenticated: boolean;
  token?: string;
  user?: SSOUser;
}

class TimeBackSSO {
  private config: Required<SSOConfig>;
  private fingerprint: string | null = null;

  constructor(config: SSOConfig) {
    this.config = {
      apiBaseUrl: config.apiBaseUrl.replace(/\/$/, ''),
      storageKey: config.storageKey || 'timeback_token',
      autoCheck: config.autoCheck ?? true,
    };

    if (this.config.autoCheck && typeof window !== 'undefined') {
      this.checkSession();
    }
  }

  /**
   * Generate a simple but stable device fingerprint
   */
  private async getFingerprint(): Promise<string> {
    if (this.fingerprint) return this.fingerprint;

    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || 0,
      // Add canvas fingerprint for more uniqueness
      await this.getCanvasFingerprint(),
    ];

    // Simple hash function
    const hash = components.join('|');
    this.fingerprint = btoa(hash).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
    return this.fingerprint;
  }

  /**
   * Canvas fingerprinting for additional uniqueness
   */
  private async getCanvasFingerprint(): Promise<string> {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return 'no-canvas';

      canvas.width = 200;
      canvas.height = 50;
      
      // Draw test string with various styles
      ctx.textBaseline = 'top';
      ctx.font = '14px "Arial"';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('TimeBack SSO 🔐', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('TimeBack SSO 🔐', 4, 17);

      return canvas.toDataURL().substring(0, 100);
    } catch {
      return 'canvas-error';
    }
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.config.storageKey);
  }

  /**
   * Store token
   */
  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.config.storageKey, token);
  }

  /**
   * Clear token
   */
  clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.config.storageKey);
  }

  /**
   * Check if user has active session on another domain
   */
  async checkSession(): Promise<CheckSessionResult> {
    try {
      const fingerprint = await this.getFingerprint();
      const domain = window.location.origin;

      const response = await fetch(`${this.config.apiBaseUrl}/api/auth/sessions/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fingerprint, domain }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.authenticated && result.data.token) {
          // Store the token
          this.setToken(result.data.token);
          return {
            authenticated: true,
            token: result.data.token,
            user: result.data.user,
          };
        }
      }

      return { authenticated: false };
    } catch (error) {
      console.error('SSO check failed:', error);
      return { authenticated: false };
    }
  }

  /**
   * Register current session for SSO
   */
  async registerSession(token?: string): Promise<boolean> {
    try {
      const authToken = token || this.getToken();
      if (!authToken) {
        throw new Error('No authentication token available');
      }

      const fingerprint = await this.getFingerprint();
      const domain = window.location.origin;

      const response = await fetch(`${this.config.apiBaseUrl}/api/auth/sessions/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ fingerprint, domain }),
      });

      return response.ok;
    } catch (error) {
      console.error('SSO registration failed:', error);
      return false;
    }
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<{ success: boolean; token?: string; user?: SSOUser }> {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        const token = result.data.accessToken;
        this.setToken(token);
        
        // Register session for SSO after successful login
        await this.registerSession(token);
        
        // Get user info
        const userResponse = await fetch(`${this.config.apiBaseUrl}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          return {
            success: true,
            token,
            user: userData.data.user,
          };
        }
      }

      return { success: false };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false };
    }
  }

  /**
   * Logout and clear session
   */
  async logout(revokeAllSessions = false): Promise<void> {
    const token = this.getToken();
    
    if (token) {
      try {
        await fetch(`${this.config.apiBaseUrl}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ revokeAllSessions }),
        });
      } catch (error) {
        console.error('Logout request failed:', error);
      }
    }

    this.clearToken();
  }

  /**
   * Make authenticated API request
   */
  async request(path: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    return fetch(`${this.config.apiBaseUrl}${path}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    });
  }
}

// React hook (optional - only loads if React is available)
let useTimeBackSSO: ((config: SSOConfig) => {
  sso: TimeBackSSO;
  isAuthenticated: boolean;
  user: SSOUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: (revokeAllSessions?: boolean) => Promise<void>;
  checkSession: () => Promise<void>;
}) | undefined;

if (typeof window !== 'undefined' && 'React' in window) {
  const React = (window as any).React;
  
  useTimeBackSSO = (config: SSOConfig) => {
    const [sso] = React.useState(() => new TimeBackSSO({ ...config, autoCheck: false }));
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [user, setUser] = React.useState(null as SSOUser | null);

    React.useEffect(() => {
      const checkAuth = async () => {
        const token = sso.getToken();
        if (token) {
          try {
            const response = await sso.request('/api/auth/me');
            if (response.ok) {
              const data = await response.json();
              setUser(data.data.user);
              setIsAuthenticated(true);
              return;
            }
          } catch {}
        }

        // Try SSO check
        const result = await sso.checkSession();
        if (result.authenticated && result.user) {
          setUser(result.user);
          setIsAuthenticated(true);
        }
      };

      checkAuth();
    }, [sso]);

    const login = React.useCallback(async (email: string, password: string) => {
      const result = await sso.login(email, password);
      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    }, [sso]);

    const logout = React.useCallback(async (revokeAllSessions = false) => {
      await sso.logout(revokeAllSessions);
      setUser(null);
      setIsAuthenticated(false);
    }, [sso]);

    const checkSession = React.useCallback(async () => {
      const result = await sso.checkSession();
      if (result.authenticated && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
      }
    }, [sso]);

    return { sso, isAuthenticated, user, login, logout, checkSession };
  };
}

export { TimeBackSSO, useTimeBackSSO, type SSOConfig, type SSOUser, type CheckSessionResult }; 