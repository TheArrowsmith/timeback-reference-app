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