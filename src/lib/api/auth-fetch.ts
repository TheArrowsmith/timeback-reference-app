import { getAuthToken } from '@/lib/auth/sso';
import { authEvents } from '@/lib/auth/auth-events';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

let isHandling401 = false;

export async function authFetch(url: string, options: FetchOptions = {}): Promise<Response> {
  const { skipAuth = false, ...fetchOptions } = options;
  
  // Add auth header if token exists and not skipped
  if (!skipAuth) {
    const token = getAuthToken();
    if (!token) {
      // No token, redirect to login
      window.location.href = '/login';
      throw new Error('Authentication required');
    }
    
    fetchOptions.headers = {
      ...fetchOptions.headers,
      'Authorization': `Bearer ${token}`,
    };
  }
  
  const response = await fetch(url, fetchOptions);
  
  // Handle 401 errors globally
  if (response.status === 401 && !skipAuth) {
    // Prevent multiple simultaneous 401 handlers
    if (isHandling401) {
      throw new Error('Session expired');
    }
    
    isHandling401 = true;
    
    // Clear any stored tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem('timeback_token');
      document.cookie = 'timeback_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // Emit logout event to sync all auth contexts
      authEvents.emitLogout();
      
      // Small delay to let state update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Redirect to login
      window.location.href = '/login';
    }
    
    isHandling401 = false;
    throw new Error('Session expired. Please log in again.');
  }
  
  return response;
}