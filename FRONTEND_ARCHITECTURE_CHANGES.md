# Frontend Architecture Changes

## Current Issues:
- Single user management for both system users and credit subjects
- Authentication confusion between user types
- No role-based UI

## Proposed Solution:

### 1. Separate User Management

#### A. System User Management (Admin Panel)
- **Route**: `/admin/users` 
- **Features**: Create system users, assign roles, manage permissions
- **Authentication**: Email/password login
- **Roles**: 
  - Admin: Full access
  - Operator: Can calculate scores, view analytics
  - Viewer: Read-only access

#### B. Credit Subject Management (Data Panel)
- **Route**: `/subjects` or `/clients`
- **Features**: Import CSV, view subject details, calculate scores
- **No authentication needed** (they're data subjects, not system users)

### 2. Updated Navigation Structure
```
Dashboard (System Overview)
├── Analytics (Score trends, metrics)
├── Credit Subjects (People being scored)
│   ├── Import CSV
│   ├── View Subjects
│   ├── Calculate Scores
│   └── Subject Details
├── System Administration (Admin only)
│   ├── System Users
│   ├── Roles & Permissions
│   └── System Settings
└── Settings (Profile, etc.)
```

### 3. Authentication Flow
```javascript
// System User Login
POST /api/v1/auth/login
{
  "email": "admin@creditscore.com",
  "password": "secure_password"
}

// Returns JWT for system user only
{
  "access_token": "jwt_token",
  "user": {
    "id": "system_user_id",
    "email": "admin@creditscore.com", 
    "role": "admin",
    "full_name": "System Administrator"
  }
}
```

### 4. API Endpoint Restructuring
```
# System User Management
POST   /api/v1/admin/users          # Create system user
GET    /api/v1/admin/users          # List system users
PUT    /api/v1/admin/users/:id      # Update system user
DELETE /api/v1/admin/users/:id      # Delete system user

# Credit Subject Management  
POST   /api/v1/subjects/import      # Import CSV subjects
GET    /api/v1/subjects             # List credit subjects
GET    /api/v1/subjects/:id         # Get subject details
POST   /api/v1/subjects/:id/score   # Calculate score for subject

# Analytics (unchanged but filtered by permissions)
GET    /api/v1/analytics             # System-wide analytics
GET    /api/v1/analytics/score-distribution
GET    /api/v1/analytics/score-trends
```

### 5. Role-Based Access Control
```javascript
// Frontend route guards
const routes = [
  {
    path: '/admin/users',
    component: SystemUsers,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/subjects',
    component: CreditSubjects, 
    meta: { requiresAuth: true, roles: ['admin', 'operator'] }
  },
  {
    path: '/analytics',
    component: Analytics,
    meta: { requiresAuth: true, roles: ['admin', 'operator', 'viewer'] }
  }
]
```
