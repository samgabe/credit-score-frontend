import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { canAccessRoute } from '@/utils/permissions'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/Register.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'Dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { requiresAuth: true, permission: 'view_analytics' }
    },
    {
      path: '/dashboard',
      redirect: '/'
    },
    {
      path: '/analytics',
      name: 'Analytics',
      component: () => import('@/views/Analytics.vue'),
      meta: { requiresAuth: true, permission: 'view_analytics' }
    },
    {
      path: '/clients',
      name: 'Clients',
      component: () => import('@/views/CreditSubjects.vue'),
      meta: { requiresAuth: true, permission: 'view_credit_subjects' }
    },
    {
      path: '/clients/:id',
      name: 'ClientDetail',
      component: () => import('@/views/CreditSubjectDetail.vue'),
      meta: { requiresAuth: true, permission: 'view_credit_subjects' }
    },
    {
      path: '/credit-scores',
      name: 'CreditScores',
      component: () => import('@/views/CreditScores.vue'),
      meta: { requiresAuth: true, permission: 'view_credit_scores' }
    },
    {
      path: '/csv-upload',
      name: 'CSVUpload',
      component: () => import('@/views/CSVUpload.vue'),
      meta: { requiresAuth: true, permission: 'upload_csv' }
    },
    {
      path: '/system-users',
      name: 'SystemUsers',
      component: () => import('@/views/SystemUsers.vue'),
      meta: { requiresAuth: true, permission: 'view_system_users' }
    },
    {
      path: '/users',
      name: 'Users',
      component: () => import('@/views/Users.vue'),
      meta: { requiresAuth: true, permission: 'view_system_users' } // System operators, not clients
    },
    {
      path: '/users/:id',
      name: 'UserDetail',
      component: () => import('@/views/UserDetail.vue'),
      meta: { requiresAuth: true, permission: 'view_system_users' } // System operators
    },
    // Legacy routes for backward compatibility
    {
      path: '/credit-subjects',
      redirect: '/clients'
    },
    {
      path: '/credit-subjects/:id',
      redirect: to => `/clients/${to.params.id}`
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('@/views/Profile.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/credit-score/calculate',
      name: 'CalculateCreditScore',
      component: () => import('@/views/CreditScore.vue'),
      meta: { requiresAuth: true, permission: 'calculate_credit_scores' }
    },
    {
      path: '/credit-score/:id',
      name: 'CreditScore',
      component: () => import('@/views/CreditScore.vue'),
      meta: { requiresAuth: true, permission: 'view_credit_scores' }
    },
    {
      path: '/mpesa-statement/upload',
      name: 'MpesaStatementUpload',
      component: () => import('@/views/MpesaStatementUpload.vue'),
      meta: { requiresAuth: true, permission: 'upload_statements' }
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('@/views/Settings.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/access-denied',
      name: 'AccessDenied',
      component: () => import('@/views/AccessDenied.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFound.vue'),
      meta: { requiresAuth: false }
    }
  ]
})

// Enhanced route guard with RBAC
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Initialize auth if not already done
  if (!authStore.user && authStore.token) {
    try {
      await authStore.getCurrentUser()
    } catch (error) {
      // Token invalid, will be handled below
    }
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }

  // Redirect authenticated users away from auth pages
  if (authStore.isAuthenticated && (to.name === 'Login' || to.name === 'Register')) {
    next('/')
    return
  }

  // Check RBAC permissions
  if (to.meta.requiresAuth && to.meta.permission) {
    const userRole = authStore.userRole
    if (!canAccessRoute(userRole, to.name)) {
      // User doesn't have permission, redirect to access denied
      next('/access-denied')
      return
    }
  }

  next()
})

export default router
