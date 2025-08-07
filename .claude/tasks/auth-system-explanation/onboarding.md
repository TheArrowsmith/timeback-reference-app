# TimeBack Reference App - Authentication System Onboarding

## Task Summary
Explain how the authentication system works in the TimeBack Reference App, including SSO integration, token management, and cross-domain authentication capabilities.

## Project Context
The TimeBack Reference App is a Next.js 15 application that demonstrates integration with the TimeBack API platform. It uses a custom SSO SDK (`@timeback/sso-sdk`) for authentication, which provides device-based single sign-on across multiple domains.

## Authentication Architecture Overview

### 1. Core Components

#### SSO SDK (`@timeback/sso-sdk`)
- External package from GitHub: `github:this-is-alpha-iota/timeback-sso-auth`
- Provides `TimeBackSSO` class for authentication operations
- Features:
  - Device fingerprinting using browser characteristics and canvas
  - Cross-domain SSO support
  - Automatic session checking
  - JWT token management in localStorage

#### Auth Context (`src/lib/auth/context.tsx`)
- React Context Provider that wraps the entire app
- Manages authentication state globally
- Key state:
  - `user`: Current user object (id, email, name, role)
  - `isLoading`: Loading state during auth checks
  - `isAuthenticated`: Boolean flag for auth status
- Key methods:
  - `login()`: Authenticates with email/password
  - `logout()`: Clears session and tokens
  - `checkAuth()`: Verifies current authentication status
- Sets `timeback_token` cookie for middleware authentication

#### Auth Events (`src/lib/auth/auth-events.ts`)
- Event emitter for auth state changes
- Enables cross-tab/window synchronization
- Emits `login` and `logout` events
- Used to sync logout across multiple tabs

#### Auth Fetch (`src/lib/api/auth-fetch.ts`)
- Wrapper around native fetch for authenticated API requests
- Automatically adds `Authorization: Bearer <token>` header
- Handles 401 responses globally:
  - Clears stored tokens
  - Emits logout event
  - Redirects to login page
- Prevents multiple simultaneous 401 handlers

### 2. Authentication Flow

#### Login Process
1. User submits credentials on `/login` page
2. `AuthContext.login()` calls `sso.login(email, password)`
3. SSO SDK:
   - POSTs credentials to `/api/auth/login`
   - Receives JWT token on success
   - Stores token in localStorage
   - Registers session for SSO with device fingerprint
   - Fetches user data from `/api/auth/me`
4. AuthContext:
   - Updates user state
   - Sets `timeback_token` cookie for middleware
5. User is redirected to home page

#### SSO Check Process
1. On app load, `AuthContext` runs `checkAuth()`
2. If local token exists:
   - Validates token with `/api/auth/me`
   - Updates user state if valid
   - Clears token if invalid (401)
3. If no local token:
   - Calls `sso.checkSession()`
   - Sends device fingerprint to `/api/auth/sessions/check`
   - If SSO session exists on another domain:
     - Receives new token
     - Updates user state

#### Logout Process
1. User clicks logout button
2. `AuthContext.logout()` calls `sso.logout()`
3. SSO SDK:
   - POSTs to `/api/auth/logout` (optional: revoke all sessions)
   - Clears localStorage token
4. AuthContext:
   - Clears user state
   - Removes `timeback_token` cookie
5. User is redirected to login page

### 3. Route Protection

#### Middleware (`src/middleware.ts`)
- Runs on all routes except static files and API routes
- Checks for `timeback_token` cookie
- Redirects to `/login` if missing (except for public routes)
- Public routes: `/login`

#### Client-side Protection
- Components use `useAuth()` hook to check authentication
- Protected pages redirect if `!isAuthenticated`

### 4. Device Fingerprinting & SSO

The SSO SDK creates a unique device fingerprint using:
- User agent string
- Browser language
- Screen dimensions and color depth
- Timezone offset
- Hardware concurrency
- Canvas fingerprint (drawing unique patterns)

This fingerprint enables:
- Recognizing the same device across domains
- Automatic login if authenticated on another domain
- Secure session sharing without cookies

### 5. Token Management

#### Storage
- JWT tokens stored in localStorage (`timeback_token` key)
- Also set as HTTP-only cookie for middleware

#### Token Flow
- Login: Server → localStorage → cookie
- API requests: localStorage → Authorization header
- SSO check: Server → localStorage (if authenticated elsewhere)

#### Expiration Handling
- 401 responses trigger automatic logout
- Tokens cleared from all storage locations
- Logout event emitted for cross-tab sync

## Key Files and Components

### Authentication Core
- `/src/lib/auth/context.tsx` - Main auth provider and hook
- `/src/lib/auth/sso.ts` - SSO client initialization
- `/src/lib/auth/auth-events.ts` - Event emitter for auth state
- `/src/lib/api/auth-fetch.ts` - Authenticated fetch wrapper

### UI Components
- `/src/app/login/page.tsx` - Login page component
- `/src/components/auth/logout-button.tsx` - Reusable logout button

### Configuration
- `/src/lib/config.ts` - API base URL configuration
- `/src/middleware.ts` - Route protection middleware
- `/src/app/layout.tsx` - App wrapper with AuthProvider

### External Dependencies
- `@timeback/sso-sdk` - SSO authentication SDK
- TimeBack API endpoints:
  - `POST /api/auth/login` - Login with credentials
  - `GET /api/auth/me` - Get current user
  - `POST /api/auth/logout` - Logout
  - `POST /api/auth/sessions/check` - Check SSO session
  - `POST /api/auth/sessions/register` - Register SSO session

## Development Patterns and Conventions

1. **Client-side Only**: All auth logic runs in the browser (Next.js client components)
2. **Token First**: Always check local token before attempting SSO
3. **Global 401 Handling**: Single point of 401 response handling in auth-fetch
4. **Event-driven Sync**: Use auth events for cross-tab synchronization
5. **Cookie + localStorage**: Dual storage for middleware and client access

## Implementation Approach

To work with the auth system:
1. Use `useAuth()` hook in components for auth state
2. Use `authFetch()` for authenticated API calls
3. Protect routes with middleware configuration
4. Handle auth events for complex scenarios

## Potential Challenges

1. **Token Expiration**: No automatic token refresh implemented
2. **SSO Complexity**: Device fingerprinting may vary across browsers
3. **Cookie/Storage Sync**: Must keep cookie and localStorage in sync
4. **Cross-domain Setup**: Requires proper CORS configuration
5. **Development Mode**: SSO may not work across different localhost ports

## Questions for Clarification

1. Should token refresh be implemented for long sessions?
2. Are there plans for OAuth/social login integration?
3. Should the middleware validate tokens server-side?
4. How should role-based access control be implemented?
5. Should there be a remember me feature?