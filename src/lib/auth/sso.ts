import { TimeBackSSO } from '@timeback/sso-sdk';
import { API_CONFIG } from '@/lib/config';

// Initialize the SSO client
export const sso = new TimeBackSSO({
  apiBaseUrl: API_CONFIG.BASE_URL,
  autoCheck: true,
});

// Helper to get the current auth token
export function getAuthToken(): string | null {
  return sso.getToken();
}

// Helper to set auth token (for Cognito integration)
export function setAuthToken(token: string): void {
  // Store token in SSO SDK if method exists
  if (typeof (sso as any).setToken === 'function') {
    (sso as any).setToken(token);
  } else {
    // Fallback: store in localStorage with same key SSO SDK might use
    localStorage.setItem('timeback_token', token);
  }
}

// Helper to check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    const response = await sso.request('/api/auth/me');
    return response.ok;
  } catch {
    return false;
  }
}