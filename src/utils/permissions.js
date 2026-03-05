/**
 * Permission and Role-Based Access Control utilities for the frontend.
 * Defines roles, permissions, and utility functions for RBAC.
 */

// Role hierarchy - higher number = more permissions
export const ROLES = {
  VIEWER: 'viewer',
  OPERATOR: 'operator',
  ADMIN: 'admin'
};

// Role hierarchy levels
export const ROLE_LEVELS = {
  [ROLES.VIEWER]: 1,
  [ROLES.OPERATOR]: 2,
  [ROLES.ADMIN]: 3
};

// Permission definitions
export const PERMISSIONS = {
  // Analytics permissions
  VIEW_ANALYTICS: 'view_analytics',

  // Credit subject permissions
  VIEW_CREDIT_SUBJECTS: 'view_credit_subjects',
  CREATE_CREDIT_SUBJECTS: 'create_credit_subjects',
  UPDATE_CREDIT_SUBJECTS: 'update_credit_subjects',
  DELETE_CREDIT_SUBJECTS: 'delete_credit_subjects',

  // Credit score permissions
  VIEW_CREDIT_SCORES: 'view_credit_scores',
  CALCULATE_CREDIT_SCORES: 'calculate_credit_scores',

  // CSV upload permissions
  UPLOAD_CSV: 'upload_csv',

  // M-Pesa statement permissions
  UPLOAD_STATEMENTS: 'upload_statements',

  // System user management permissions
  VIEW_SYSTEM_USERS: 'view_system_users',
  CREATE_SYSTEM_USERS: 'create_system_users',
  UPDATE_SYSTEM_USERS: 'update_system_users',
  DELETE_SYSTEM_USERS: 'delete_system_users'
};

// Role-to-permissions mapping
export const ROLE_PERMISSIONS = {
  [ROLES.VIEWER]: [
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_CREDIT_SUBJECTS,
    PERMISSIONS.VIEW_CREDIT_SCORES,
    PERMISSIONS.VIEW_SYSTEM_USERS
  ],
  [ROLES.OPERATOR]: [
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_CREDIT_SUBJECTS,
    PERMISSIONS.CREATE_CREDIT_SUBJECTS,
    PERMISSIONS.UPDATE_CREDIT_SUBJECTS,
    PERMISSIONS.VIEW_CREDIT_SCORES,
    PERMISSIONS.CALCULATE_CREDIT_SCORES,
    PERMISSIONS.UPLOAD_CSV,
    PERMISSIONS.UPLOAD_STATEMENTS,
    PERMISSIONS.VIEW_SYSTEM_USERS
  ],
  [ROLES.ADMIN]: [
    // Admin has all permissions
    ...Object.values(PERMISSIONS)
  ]
};

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(userRole, permission) {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
}

/**
 * Check if a user role has at least the minimum required role level
 */
export function hasMinimumRole(userRole, minimumRole) {
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[minimumRole];
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role) {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if user can access a specific route based on their role
 */
export function canAccessRoute(userRole, routeName) {
  const routePermissions = {
    'dashboard': PERMISSIONS.VIEW_ANALYTICS,
    'analytics': PERMISSIONS.VIEW_ANALYTICS,
    'credit-subjects': PERMISSIONS.VIEW_CREDIT_SUBJECTS,
    'credit-scores': PERMISSIONS.VIEW_CREDIT_SCORES,
    'csv-upload': PERMISSIONS.UPLOAD_CSV,
    'system-users': PERMISSIONS.VIEW_SYSTEM_USERS,
    'profile': null // Everyone can access their profile
  };

  const requiredPermission = routePermissions[routeName];

  // If no permission required, allow access
  if (!requiredPermission) return true;

  return hasPermission(userRole, requiredPermission);
}

/**
 * Get navigation items based on user role
 */
export function getNavigationItems(userRole) {
  const allItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: 'chart-bar',
      permission: PERMISSIONS.VIEW_ANALYTICS
    },
    {
      name: 'Analytics',
      path: '/analytics',
      icon: 'chart-line',
      permission: PERMISSIONS.VIEW_ANALYTICS
    },
    {
      name: 'Credit Subjects',
      path: '/credit-subjects',
      icon: 'users',
      permission: PERMISSIONS.VIEW_CREDIT_SUBJECTS
    },
    {
      name: 'Credit Scores',
      path: '/credit-scores',
      icon: 'calculator',
      permission: PERMISSIONS.VIEW_CREDIT_SCORES
    },
    {
      name: 'CSV Upload',
      path: '/csv-upload',
      icon: 'document-upload',
      permission: PERMISSIONS.UPLOAD_CSV
    },
    {
      name: 'M-Pesa Statement',
      path: '/mpesa-statement/upload',
      icon: 'upload',
      permission: PERMISSIONS.UPLOAD_STATEMENTS
    },
    {
      name: 'System Users',
      path: '/system-users',
      icon: 'shield',
      permission: PERMISSIONS.VIEW_SYSTEM_USERS
    }
  ]

  return allItems.filter(item =>
    !item.permission || hasPermission(userRole, item.permission)
  )
}
