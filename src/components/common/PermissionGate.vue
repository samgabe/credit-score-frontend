<template>
  <div v-if="hasAccess">
    <slot />
  </div>
  <div v-else-if="showFallback">
    <slot name="fallback">
      <div class="permission-denied">
        <p>You don't have permission to access this content.</p>
      </div>
    </slot>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { hasPermission, hasMinimumRole } from '@/utils/permissions'

export default {
  name: 'PermissionGate',
  props: {
    permission: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: null
    },
    showFallback: {
      type: Boolean,
      default: false
    },
    fallback: {
      type: String,
      default: null
    }
  },
  setup(props) {
    const authStore = useAuthStore()
    
    const hasAccess = computed(() => {
      if (!authStore.user) return false
      
      // Check specific permission
      if (props.permission) {
        return hasPermission(authStore.user.role, props.permission)
      }
      
      // Check minimum role
      if (props.role) {
        return hasMinimumRole(authStore.user.role, props.role)
      }
      
      return false
    })
    
    return {
      hasAccess
    }
  }
}
</script>

<style scoped>
.permission-denied {
  padding: 1rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.375rem;
  color: #dc2626;
  text-align: center;
}
</style>
