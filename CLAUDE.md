# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TimeBack Reference App - A Next.js 15 application that demonstrates integration with the TimeBack API for QTI assessments and OneRoster data management. Currently READ-ONLY with plans for full CRUD implementation.

## Development Commands

```bash
# Install dependencies
bun install

# Run development server (with Turbopack)
bun run dev

# Build for production
bun run build

# Start production server
bun start

# Run linting
bun run lint

# View data from local TimeBack instance
data/oneroster/view_data.sh

# Delete all data from local TimeBack instance
data/oneroster/delete_data.sh
```

## Backend Setup Requirements

Before running the app, you need a local TimeBack instance:

1. Clone the TimeBack repo (private repository)
1a. **Important**: Ensure environment variables are set from the Google doc pinned in #alpha-school-apps Slack channel
2. Set up authentication:
   ```bash
   # In TimeBack repo directory
   bun auth-helper.ts register test@example.com TestPassword123! 'Test User'
   bun auth-helper.ts confirm test@example.com 123456
   bun auth-helper.ts login test@example.com TestPassword123!
   ```
3. Save the JWT token: `export JWT_TOKEN=<your-token>`
4. Seed data from this repo:
   ```bash
   data/oneroster/create_data.sh
   data/qti/upload_quiz.sh
   ```

## Architecture Overview

### API Integration Layer
- **QTI Client** (`src/lib/api/qti-client.ts`): Handles QTI assessment operations
- **OneRoster Client** (`src/lib/api/oneroster-client.ts`): Manages educational data entities
- **Auth Fetch** (`src/lib/api/auth-fetch.ts`): Wrapper for authenticated API requests
- **Config** (`src/lib/config.ts`): API endpoints configuration
  - Base URL: `http://localhost:8080`
  - OneRoster path: `/ims/oneroster/rostering/v1p2`
  - QTI path: `/ims/qti/v3p0`

### Authentication System
- SSO SDK integration via `@timeback/sso-sdk` (GitHub dependency)
- Auth context (`src/lib/auth/context.tsx`): Manages authentication state
- SSO client (`src/lib/auth/sso.ts`): Handles login/logout operations
- Auth events (`src/lib/auth/auth-events.ts`): Event handling for auth state changes
- Middleware (`src/middleware.ts`): Route protection using cookies

### Key Routes
- `/` - Home page
- `/login` - Authentication page
- `/assessment/[id]` - QTI assessment viewer
- `/oneroster` - OneRoster data dashboard (6 entity views)

### Component Structure
- UI components use shadcn/ui library (in `src/components/ui/`)
- Entity-specific views (e.g., `users-view.tsx`, `classes-view.tsx`)
- QTI components for rendering assessments (`src/components/qti/`)

## Implementation Status

### Completed
- Authentication with SSO integration
- Read operations for all OneRoster entities
- QTI assessment viewing
- Responsive UI with Tailwind CSS v4

### In Progress (per IMPLEMENTATION_PLAN.md)
- Phase 1: SSO Authentication refinements
- Phase 2: Write operations for QTI and OneRoster APIs
- Phase 3: Enhanced UI/UX with forms and state management
- Phase 4: Updated seeding scripts

## Data Seeding Scripts

Located in `data/` directory:
- `oneroster/`: JSON files and scripts for OneRoster entities
  - Creates hierarchical data: Organization → Academic Sessions → Courses → Classes → Users → Enrollments
  - Generates random email suffixes to avoid conflicts
- `qti/`: XML files and upload script for QTI assessments
  - Creates assessment test structure with multiple choice and text entry questions

## TypeScript Patterns

The project uses TypeScript with strict typing. Key patterns:
- API responses are typed (e.g., `User`, `Organization`, `AssessmentTest`)
- React components use typed props
- Async operations use proper error handling
- Path aliases: `@/*` maps to `./src/*`

## Environment Variables

- `NEXT_PUBLIC_API_URL`: TimeBack API URL (defaults to `http://localhost:8080`)
- `JWT_TOKEN`: Required for data seeding scripts
- `DOMAIN`: Optional override for API URL in seeding scripts

## Known Issues & Notes

- The SSO SDK requires a postinstall build step (handled automatically)
- XML content in QTI responses may be hardcoded due to incomplete API responses
- Middleware checks for `timeback_token` cookie for authentication

## 🎓 Cognito Authentication Integration Plan

**Context**: This is a student project prioritizing ease of development. Cognito handles security server-side.

### Quick Overview
Merge existing Cognito auth (`authHelper.ts` + `auth-app.html`) into the Next.js app with minimal changes.

### Simple Authentication Flow
1. User enters email only (no password field shown)
2. Password is always hardcoded as `TestPassword123!`
3. Try login → If user doesn't exist → Auto-register → Show 6-digit code input
4. User enters code → Auto-login → Done

### Implementation Steps

#### 1. Install Dependencies
```bash
bun add @aws-sdk/client-cognito-identity-provider
```

#### 2. Add Environment Variables
```env
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_Bzhz5PGqq
NEXT_PUBLIC_COGNITO_CLIENT_ID=4i6vie24a9jp2hthaiuf1emh9k
```

#### 3. Create Minimal File Structure
```
/src/lib/auth/
  └─ cognito.ts          # Port the 3 functions from authHelper.ts

/src/app/login/
  └─ page.tsx           # Update with email-only + code input
```

#### 4. Integration Approach
- Copy working functions from `authHelper.ts`
- Convert HTML UI from `auth-app.html` to React components
- Store Cognito tokens where SSO SDK expects them
- Let existing auth context handle the rest

#### 5. Simple Token Refresh
Add basic token refresh to prevent logouts during usage:

**Storage:**
```typescript
// In cognito.ts - Store all tokens after login
localStorage.setItem('accessToken', AccessToken);
localStorage.setItem('refreshToken', RefreshToken);
localStorage.setItem('idToken', IdToken);
```

**Refresh Function:**
```typescript
// In cognito.ts - Add simple refresh function
async function refreshToken() {
  const refreshToken = localStorage.getItem('refreshToken');
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
    // Store new tokens and return access token
    return response.AuthenticationResult?.AccessToken;
  } catch {
    // Refresh failed - clear tokens
    localStorage.clear();
    return null;
  }
}
```

**Auto-Refresh on 401:**
```typescript
// In auth-fetch.ts - Modify authFetch to retry once on 401
if (response.status === 401 && !isRetry) {
  const newToken = await refreshToken();
  if (newToken) {
    // Update SSO SDK with new token
    // Retry the request once
  }
}
```

**That's it!** Simple refresh that works. No complex token expiry tracking or request queuing.

### What We're NOT Doing (Keep It Simple!)
- ❌ Complex error handling (basic try/catch is fine)
- ❌ Password reset flows
- ❌ Rate limiting (Cognito handles it)

### Testing Checklist
- [ ] New email → Get code → Enter code → Login
- [ ] Existing email → Direct login
- [ ] Wrong code → Show error
- [ ] Page refresh → Still logged in
- [ ] Wait for token expiry (1 hour) → Make API call → Auto-refreshes → Call succeeds
- [ ] Delete refresh token → Make API call after expiry → Redirects to login

This approach reuses existing working code and can be implemented quickly. Future enhancements can be added by other students as needed.