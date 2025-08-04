import { getAuthToken, setAuthToken } from '@/lib/auth/sso';
import { authEvents } from '@/lib/auth/auth-events';
import { refreshAccessToken, getAccessToken, clearTokens as clearCognitoTokens } from '@/lib/auth/cognito';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
  isRetry?: boolean;
}

let isHandling401 = false;

export async function authFetch(url: string, options: FetchOptions = {}): Promise<Response> {
  const { skipAuth = false, isRetry = false, ...fetchOptions } = options;
  
  // Add auth header if token exists and not skipped
  if (!skipAuth) {
    // Try to get Cognito token first, then fallback to SSO token
    const cognitoToken = getAccessToken();
    const token = cognitoToken || getAuthToken();
    
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
    // If this is not a retry and we have Cognito tokens, try to refresh
    if (!isRetry && getAccessToken()) {
      console.log('Got 401, attempting token refresh...');
      
      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          console.log('Token refreshed successfully, retrying request...');
          // Update SSO SDK with new token
          setAuthToken(newToken);
          
          // Update cookie for middleware
          document.cookie = `timeback_token=${newToken}; path=/; max-age=86400`;
          
          // Retry the request with new token
          return authFetch(url, { ...options, isRetry: true });
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }
    
    // Prevent multiple simultaneous 401 handlers
    if (isHandling401) {
      throw new Error('Session expired');
    }
    
    isHandling401 = true;
    
    // Clear any stored tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem('timeback_token');
      clearCognitoTokens();
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