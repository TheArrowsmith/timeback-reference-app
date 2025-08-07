import { 
  CognitoIdentityProviderClient, 
  SignUpCommand, 
  ConfirmSignUpCommand, 
  InitiateAuthCommand,
  type AuthenticationResultType 
} from "@aws-sdk/client-cognito-identity-provider";

// Cognito configuration from auth-app.html
const COGNITO_CONFIG = {
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "us-east-1_Bzhz5PGqq",
  clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || "4i6vie24a9jp2hthaiuf1emh9k",
  region: process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1"
};

// Log configuration on load (for debugging)
if (typeof window !== 'undefined') {
  console.log('Cognito Configuration:', {
    userPoolId: COGNITO_CONFIG.userPoolId,
    clientId: COGNITO_CONFIG.clientId,
    region: COGNITO_CONFIG.region
  });
}

// Hardcoded password for all users (student project simplicity)
const DEFAULT_PASSWORD = "TestPassword123!";

// Initialize Cognito client
const client = new CognitoIdentityProviderClient({ region: COGNITO_CONFIG.region });

// Token storage keys
const TOKEN_KEYS = {
  ACCESS: 'cognito_access_token',
  REFRESH: 'cognito_refresh_token',
  ID: 'cognito_id_token'
};

export interface CognitoTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
}

// Store tokens in localStorage
function storeTokens(authResult: AuthenticationResultType) {
  if (authResult.AccessToken) {
    localStorage.setItem(TOKEN_KEYS.ACCESS, authResult.AccessToken);
  }
  if (authResult.RefreshToken) {
    localStorage.setItem(TOKEN_KEYS.REFRESH, authResult.RefreshToken);
  }
  if (authResult.IdToken) {
    localStorage.setItem(TOKEN_KEYS.ID, authResult.IdToken);
  }
}

// Clear all stored tokens
export function clearTokens() {
  Object.values(TOKEN_KEYS).forEach(key => localStorage.removeItem(key));
}

// Get stored tokens
export function getStoredTokens(): CognitoTokens | null {
  const accessToken = localStorage.getItem(TOKEN_KEYS.ACCESS);
  const refreshToken = localStorage.getItem(TOKEN_KEYS.REFRESH);
  const idToken = localStorage.getItem(TOKEN_KEYS.ID);
  
  if (!accessToken || !refreshToken || !idToken) {
    return null;
  }
  
  return { accessToken, idToken, refreshToken };
}

// Register a new user
export async function registerUser(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const command = new SignUpCommand({
      ClientId: COGNITO_CONFIG.clientId,
      Username: email,
      Password: DEFAULT_PASSWORD,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "name", Value: "Test User" }
      ]
    });
    
    await client.send(command);
    return { success: true };
  } catch (error: any) {
    if (error.name === "UsernameExistsException") {
      // User already exists, this is fine - they can proceed to login
      return { success: true };
    }
    // Only log unexpected registration errors
    if (error.name !== "UsernameExistsException") {
      console.error('Registration error:', error);
    }
    return { success: false, error: error.message || "Registration failed" };
  }
}

// Confirm user registration with code
export async function confirmUser(email: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    const command = new ConfirmSignUpCommand({
      ClientId: COGNITO_CONFIG.clientId,
      Username: email,
      ConfirmationCode: code
    });
    
    await client.send(command);
    return { success: true };
  } catch (error: any) {
    // If already confirmed, that's fine
    if (error.name === "NotAuthorizedException" && error.message?.includes("already confirmed")) {
      return { success: true };
    }
    // Only log unexpected confirmation errors
    if (!error.message?.includes("already confirmed")) {
      console.error('Confirmation error:', error);
    }
    return { success: false, error: error.message || "Confirmation failed" };
  }
}

// Login user
// Note: AWS SDK will log UserNotFoundException to console even when caught - this is expected behavior
export async function loginUser(email: string): Promise<{ success: boolean; tokens?: CognitoTokens; error?: string; needsConfirmation?: boolean }> {
  try {
    const command = new InitiateAuthCommand({
      ClientId: COGNITO_CONFIG.clientId,
      AuthFlow: "USER_PASSWORD_AUTH",
      AuthParameters: {
        USERNAME: email,
        PASSWORD: DEFAULT_PASSWORD
      }
    });
    
    const response = await client.send(command);
    
    if (response.AuthenticationResult) {
      storeTokens(response.AuthenticationResult);
      
      return {
        success: true,
        tokens: {
          accessToken: response.AuthenticationResult.AccessToken!,
          idToken: response.AuthenticationResult.IdToken!,
          refreshToken: response.AuthenticationResult.RefreshToken!
        }
      };
    }
    
    return { success: false, error: "No authentication result" };
  } catch (error: any) {
    // User doesn't exist - this is expected for new users
    if (error.name === "UserNotFoundException" || 
        error.code === "UserNotFoundException" ||
        (error.name === "NotAuthorizedException" && error.message?.includes("User does not exist"))) {
      console.log(`New user detected: ${email}. Starting registration process...`);
      // Try to register the user
      const registerResult = await registerUser(email);
      if (registerResult.success) {
        console.log('✅ Registration initiated. Check email for confirmation code.');
        return { success: false, needsConfirmation: true };
      }
      console.error('Registration failed:', registerResult.error);
      return { success: false, error: registerResult.error };
    }
    
    // User exists but not confirmed - also expected
    if (error.name === "UserNotConfirmedException" || error.code === "UserNotConfirmedException") {
      console.log('User exists but needs confirmation');
      return { success: false, needsConfirmation: true };
    }
    
    // These are actual errors we want to log
    console.error('Login error:', error);
    console.log('Error details:', { name: error.name, code: error.code, message: error.message });
    
    // Check for incorrect password (shouldn't happen with hardcoded password)
    if (error.name === "NotAuthorizedException" && !error.message?.includes("User does not exist")) {
      return { success: false, error: "Authentication failed. This might be a configuration issue." };
    }
    
    return { success: false, error: error.message || "Login failed" };
  }
}

// Refresh access token
export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem(TOKEN_KEYS.REFRESH);
  if (!refreshToken) return null;
  
  try {
    const command = new InitiateAuthCommand({
      ClientId: COGNITO_CONFIG.clientId,
      AuthFlow: "REFRESH_TOKEN_AUTH",
      AuthParameters: {
        REFRESH_TOKEN: refreshToken
      }
    });
    
    const response = await client.send(command);
    
    if (response.AuthenticationResult) {
      // Store new tokens (refresh token stays the same)
      if (response.AuthenticationResult.AccessToken) {
        localStorage.setItem(TOKEN_KEYS.ACCESS, response.AuthenticationResult.AccessToken);
      }
      if (response.AuthenticationResult.IdToken) {
        localStorage.setItem(TOKEN_KEYS.ID, response.AuthenticationResult.IdToken);
      }
      
      return response.AuthenticationResult.AccessToken || null;
    }
    
    return null;
  } catch (error) {
    console.error("Token refresh failed:", error);
    // Clear all tokens on refresh failure
    clearTokens();
    return null;
  }
}

// Get current access token
export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEYS.ACCESS);
}