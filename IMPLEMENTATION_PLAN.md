# TimeBack Reference App - Implementation Plan

## Current State Analysis

### What's Currently Implemented

#### Frontend Infrastructure
- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Architecture**: App Router pattern

#### API Integration (READ-only)
1. **QTI Client** (`src/lib/api/qti-client.ts`)
   - Fetches assessment tests
   - Retrieves test parts, sections, and items
   - Downloads item XML content
   - **Issue**: Some XML content is hardcoded due to incomplete API responses

2. **OneRoster Client** (`src/lib/api/oneroster-client.ts`)
   - Fetches Organizations
   - Fetches Academic Sessions
   - Fetches Courses
   - Fetches Classes
   - Fetches Users
   - Fetches Enrollments

#### Views
1. **Assessment Viewer** (`/assessment/[id]`)
   - Renders QTI assessment tests
   - Shows questions and interactions

2. **OneRoster Dashboard** (`/oneroster`)
   - Six different views with navigation
   - Read-only data display
   - Relationship navigation between entities

#### Data Seeding
- Shell scripts for uploading test data
- QTI XML files for sample assessments
- OneRoster JSON files for school data

### What's Missing/Hardcoded

1. **Authentication**
   - JWT token hardcoded in `config.ts`
   - No login/logout functionality
   - No session management

2. **Write Operations**
   - No CREATE functionality
   - No UPDATE functionality  
   - No DELETE functionality

3. **User Experience**
   - No forms for data entry
   - No success/error feedback
   - No loading states for mutations

## Implementation Plan

### Phase 1: SSO Authentication Integration

#### 1.1 Install Dependencies
```bash
npm install github:this-is-alpha-iota/timeback-sso-auth
```

#### 1.2 Create Auth Infrastructure
- `/src/lib/auth/sso.ts` - SSO client initialization
- `/src/app/login/page.tsx` - Login page
- `/src/middleware.ts` - Route protection
- `/src/components/auth/logout-button.tsx` - Logout component

#### 1.3 Update API Clients
- Remove hardcoded JWT from config
- Use dynamic token from SSO SDK
- Add token refresh handling

#### 1.4 Protected Routes
- Protect `/assessment/*` routes
- Protect `/oneroster/*` routes
- Redirect to login when unauthenticated

### Phase 2: Expand API Operations

#### 2.1 QTI API - Write Operations
**Create Operations:**
- Create new assessment test
- Create test parts
- Create sections
- Create items

**Update Operations:**
- Update test metadata
- Update item content
- Update section properties

**Delete Operations:**
- Delete items
- Delete sections
- Delete entire tests

#### 2.2 OneRoster API - Write Operations
**Create Operations:**
- Create organizations
- Create academic sessions
- Create courses
- Create classes
- Create users
- Create enrollments

**Update Operations:**
- Update user profiles
- Update class information
- Update enrollment status

**Delete Operations:**
- Delete users
- Delete enrollments
- Delete classes

### Phase 3: Enhanced UI/UX

#### 3.1 Forms and Modals
- Create/Edit forms for each entity type
- Validation and error handling
- Confirmation dialogs for deletions

#### 3.2 State Management
- Loading states for all operations
- Optimistic updates
- Error recovery

#### 3.3 Notifications
- Success toast messages
- Error alerts
- Progress indicators

### Phase 4: Update Seeding Scripts

#### 4.1 Authentication Flow
- Script to obtain auth token
- Token storage for subsequent requests
- Token refresh handling

#### 4.2 Comprehensive Seeding
- Master script to create full school environment
- Parameterized data generation
- Cleanup/reset functionality

## Technical Architecture

### File Structure
```
/src
  /app
    /login
      page.tsx          # SSO login page
    /(protected)        # Group for protected routes
      /dashboard
        page.tsx        # Main dashboard
      /assessment
        /[id]
          page.tsx      # Assessment viewer
      /oneroster
        page.tsx        # OneRoster dashboard
        /[entity]
          /new
            page.tsx    # Create forms
          /[id]
            /edit
              page.tsx  # Edit forms
    layout.tsx
    
  /components
    /auth
      login-form.tsx
      logout-button.tsx
      auth-provider.tsx
    /forms              # New CRUD forms
      user-form.tsx
      class-form.tsx
      course-form.tsx
      etc...
    
  /lib
    /auth
      sso.ts            # SSO client setup
      context.tsx       # Auth context provider
    /api
      qti-client.ts     # Enhanced with CRUD
      oneroster-client.ts # Enhanced with CRUD
    /hooks
      use-auth.ts       # Auth hook
      use-toast.ts      # Notification hook
      
  /middleware.ts        # Route protection
```

### API Client Pattern
```typescript
// Example enhanced client structure
class OneRosterClient {
  constructor(private getToken: () => string) {}
  
  // READ operations (existing)
  async fetchUsers() { ... }
  
  // CREATE operations (new)
  async createUser(data: CreateUserInput) { ... }
  
  // UPDATE operations (new)
  async updateUser(id: string, data: UpdateUserInput) { ... }
  
  // DELETE operations (new)
  async deleteUser(id: string) { ... }
}
```

### Component Pattern
```typescript
// Example CRUD component pattern
function UsersView() {
  // State management
  const [users, setUsers] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  
  // CRUD operations
  const handleCreate = async (data) => { ... };
  const handleUpdate = async (id, data) => { ... };
  const handleDelete = async (id) => { ... };
  
  // UI with full CRUD
  return (
    <>
      <Button onClick={() => setIsCreating(true)}>
        Create User
      </Button>
      <UsersList 
        users={users}
        onEdit={handleUpdate}
        onDelete={handleDelete}
      />
      <CreateUserModal 
        open={isCreating}
        onClose={() => setIsCreating(false)}
        onSubmit={handleCreate}
      />
    </>
  );
}
```

## Implementation Priority

1. **Week 1**: SSO Authentication
   - Login/logout functionality
   - Route protection
   - Dynamic token usage

2. **Week 2**: OneRoster Write Operations
   - User CRUD
   - Class/Course CRUD
   - Enrollment management

3. **Week 3**: QTI Write Operations
   - Assessment creation
   - Item management
   - Content updates

4. **Week 4**: Polish & Documentation
   - Error handling
   - Loading states
   - User guide
   - API examples

## Success Criteria

- [ ] Users can login via SSO
- [ ] All routes are properly protected
- [ ] Full CRUD operations for OneRoster entities
- [ ] Full CRUD operations for QTI assessments
- [ ] Intuitive UI with proper feedback
- [ ] Comprehensive seeding scripts
- [ ] Complete API usage examples
- [ ] Production-ready error handling

## Notes

- The app already has a solid foundation
- Focus on maintaining the existing clean architecture
- Ensure all examples follow TimeBack API best practices
- Consider adding API request/response logging for debugging
- Include rate limiting awareness in the implementation