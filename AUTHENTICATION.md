# TimeBack Reference App - Authentication Guide

This guide explains how authentication works in the TimeBack Reference App, providing a simple, streamlined approach for development and testing.

## Overview

The TimeBack Reference App uses AWS Cognito for authentication with a unique "combined sign-in/sign-up" flow that makes testing and development easier. Instead of separate registration and login forms, the app uses a single email entry point that automatically handles both scenarios.

## Key Features

### 🔐 Simplified Authentication Flow

1. **Single Entry Point**: Users only enter their email address
2. **Automatic Registration**: If the user doesn't exist, they're automatically registered
3. **Fixed Password**: All accounts use the password `TestPassword123!` for simplicity
4. **Email Confirmation**: New users receive a 6-digit code via email to verify their account
5. **Seamless Login**: Existing users are logged in immediately

### 🛠️ How It Works

#### Step 1: Email Entry
```typescript
// User enters email and clicks "Continue"
const result = await loginUser(email);

if (result.success && result.tokens) {
  // Existing user - logged in successfully
  router.push('/');
} else if (result.needsConfirmation) {
  // New user - show confirmation code input
  setStep('confirmation');
}
```

#### Step 2: Behind the Scenes
```typescript
// In cognito.ts - loginUser function
try {
  // Try to login with email and default password
  const response = await client.send(new InitiateAuthCommand({
    ClientId: COGNITO_CONFIG.clientId,
    AuthFlow: "USER_PASSWORD_AUTH",
    AuthParameters: {
      USERNAME: email,
      PASSWORD: "TestPassword123!" // Fixed password for all users
    }
  }));
  
  // Login successful - return tokens
  return { success: true, tokens: {...} };
  
} catch (error) {
  // User doesn't exist - automatically register them
  if (error.name === "UserNotFoundException") {
    const registerResult = await registerUser(email);
    if (registerResult.success) {
      return { success: false, needsConfirmation: true };
    }
  }
}
```

#### Step 3: Email Confirmation
- New users receive a 6-digit code from AWS Cognito
- Enter the code to complete registration
- After confirmation, the app automatically logs them in

## Error Handling

The app provides intelligent error handling with user-friendly messages:

### Common Errors and How They're Handled

#### 1. **User Not Found (New User)**
```typescript
if (error.name === "UserNotFoundException") {
  // Automatically trigger registration
  const registerResult = await registerUser(email);
  return { success: false, needsConfirmation: true };
}
```
**User sees**: Confirmation code input screen

#### 2. **Network/Connection Issues**
```typescript
if (err.message?.includes('Network') || err.message?.includes('fetch')) {
  setError('Cannot connect to the server. Please ensure the TimeBack backend is running on http://localhost:8080');
}
```
**User sees**: Clear message about checking backend connection

#### 3. **Invalid Confirmation Code**
```typescript
if (confirmResult.error?.includes('CodeMismatch')) {
  setError('Invalid confirmation code. Please check the 6-digit code sent to your email.');
}
```
**User sees**: Helpful message about checking their email

#### 4. **Expired Confirmation Code**
```typescript
if (confirmResult.error?.includes('Expired')) {
  setError('Confirmation code has expired. Please request a new code by entering your email again.');
}
```
**User sees**: Instructions to start over with a fresh code

## Built-in User Guidance

The login page includes helpful tips for common scenarios:

### First Time Setup Tips
- Make sure TimeBack backend is running on port 8080
- Check email spam folder for confirmation codes
- Confirmation codes expire after 24 hours

### Didn't Receive a Code?
- Check spam/junk folder
- Verify correct email was entered
- Codes are sent from AWS Cognito
- Try a different email if issues persist

## Token Management

### Storage
Tokens are stored in localStorage for persistence:
```typescript
localStorage.setItem('cognito_access_token', accessToken);
localStorage.setItem('cognito_refresh_token', refreshToken);
localStorage.setItem('cognito_id_token', idToken);
```

### Automatic Token Refresh
When an API call receives a 401 (unauthorized) response:
```typescript
// In auth-fetch.ts
if (response.status === 401 && !isRetry) {
  const newToken = await refreshAccessToken();
  if (newToken) {
    // Retry the request with new token
    return authFetch(url, { ...options, isRetry: true });
  }
}
```

## Configuration

### Environment Variables
Add to `.env.local`:
```env
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_Bzhz5PGqq
NEXT_PUBLIC_COGNITO_CLIENT_ID=4i6vie24a9jp2hthaiuf1emh9k
NEXT_PUBLIC_AWS_REGION=us-east-1
```

### Fixed Password
The app uses `TestPassword123!` as the password for all accounts. This simplifies testing and development.

## Code Examples

### Implementing the Combined Sign-in/Sign-up
```typescript
// Login page component
const handleEmailSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const result = await loginUser(email);
    
    if (result.success && result.tokens) {
      // Existing user - proceed to app
      await setCognitoAuth(result.tokens);
      router.push('/');
    } else if (result.needsConfirmation) {
      // New user - show confirmation UI
      setStep('confirmation');
    } else {
      // Show error
      setError(result.error);
    }
  } catch (err) {
    setError('An unexpected error occurred');
  } finally {
    setIsLoading(false);
  }
};
```

### Handling Confirmation
```typescript
const handleConfirmationSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    // Confirm the user
    const confirmResult = await confirmUser(email, confirmationCode);
    if (!confirmResult.success) {
      setError(confirmResult.error);
      return;
    }

    // Auto-login after confirmation
    const loginResult = await loginUser(email);
    if (loginResult.success && loginResult.tokens) {
      await setCognitoAuth(loginResult.tokens);
      router.push('/');
    }
  } catch (err) {
    setError('An error occurred during confirmation');
  } finally {
    setIsLoading(false);
  }
};
```

## Benefits for Development

1. **No Password Management**: Users don't need to remember passwords during testing
2. **Quick Onboarding**: New users can sign up and sign in within seconds
3. **Reduced Friction**: Single form handles both registration and login
4. **Clear Error Messages**: Users know exactly what went wrong and how to fix it
5. **Automatic Token Refresh**: Sessions stay active during development

## Future Enhancements

While the current implementation prioritizes ease of testing, you can extend it with:

- Custom password support (add a password field)
- Password reset functionality
- Multi-factor authentication
- Social login providers
- Remember me functionality
- Session timeout configuration

## Testing the Authentication Flow

1. **New User**:
   - Enter a new email → Receive code → Enter code → Logged in

2. **Existing User**:
   - Enter existing email → Immediately logged in

3. **Token Refresh**:
   - Wait 1 hour or manually delete access token
   - Make any API call → Token automatically refreshes

4. **Error Scenarios**:
   - Wrong confirmation code → Clear error message
   - Backend not running → Connection error with instructions
   - Expired code → Instructions to get a new one

## Troubleshooting

### "UserNotFoundException" in Console
This is expected behavior when a new user signs up. The AWS SDK logs the error even though we handle it properly. The app continues to work correctly.

### No Confirmation Email
- Check spam/junk folder
- Verify email address is correct
- Check AWS Cognito settings in AWS Console
- Ensure SES (Simple Email Service) is configured

### Cannot Connect to Server
- Ensure TimeBack backend is running on `http://localhost:8080`
- Check network connectivity
- Verify API_URL in environment variables

## Summary

This authentication system provides a frictionless development experience while maintaining security through AWS Cognito. The combined sign-in/sign-up flow, fixed password, and intelligent error handling make it ideal for reference implementations and testing scenarios.