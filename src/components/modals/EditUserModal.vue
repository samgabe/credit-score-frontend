<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-screen items-center justify-center p-4">
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="scale-95 opacity-0"
            enter-to-class="scale-100 opacity-100"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="scale-100 opacity-100"
            leave-to-class="scale-95 opacity-0"
          >
            <div class="glass-effect rounded-2xl max-w-md w-full p-6">
              <!-- Header -->
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-semibold text-gray-900">Edit User</h3>
                <button
                  @click="close"
                  class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X class="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <!-- User Info -->
              <div v-if="user" class="mb-6 p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-3">
                  <div class="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                    <User class="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ user.fullname }}</p>
                    <p class="text-sm text-gray-500">ID: {{ user.national_id }}</p>
                  </div>
                </div>
              </div>

              <!-- Form -->
              <form @submit.prevent="handleSubmit" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    v-model="form.fullname"
                    type="text"
                    required
                    class="input-field"
                    :class="{ 'border-red-500': errors.fullname }"
                    placeholder="John Doe"
                  />
                  <p v-if="errors.fullname" class="text-red-500 text-xs mt-1">{{ errors.fullname }}</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    v-model="form.phone_number"
                    type="tel"
                    required
                    class="input-field"
                    :class="{ 'border-red-500': errors.phone_number }"
                    placeholder="+254712345678"
                  />
                  <p v-if="errors.phone_number" class="text-red-500 text-xs mt-1">{{ errors.phone_number }}</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    v-model="form.email"
                    type="email"
                    class="input-field"
                    :class="{ 'border-red-500': errors.email }"
                    placeholder="john.doe@example.com"
                  />
                  <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
                </div>

                <!-- Actions -->
                <div class="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    @click="close"
                    class="btn-secondary"
                    :disabled="loading"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="btn-primary"
                    :disabled="loading"
                  >
                    <div v-if="loading" class="loading-spinner w-4 h-4 mr-2"></div>
                    Update User
                  </button>
                </div>
              </form>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useCreditStore } from '@/stores/credit'
import { useNotificationStore } from '@/stores/notification'
import api from '@/utils/api'
import { X, User } from 'lucide-vue-next'

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'updated'])
const creditStore = useCreditStore()
const notificationStore = useNotificationStore()

const show = ref(true)
const loading = ref(false)

const form = reactive({
  fullname: props.user?.fullname || '',
  phone_number: props.user?.phone_number || '',
  email: props.user?.email || ''
})

const errors = reactive({
  fullname: '',
  phone_number: '',
  email: ''
})

const validateForm = () => {
  // Reset errors
  Object.keys(errors).forEach(key => errors[key] = '')

  let isValid = true

  if (!form.fullname.trim()) {
    errors.fullname = 'Full name is required'
    isValid = false
  }

  if (!form.phone_number.trim()) {
    errors.phone_number = 'Phone number is required'
    isValid = false
  } else if (!/^[\+]?[0-9\s\-\(\)]+$/.test(form.phone_number)) {
    errors.phone_number = 'Please enter a valid phone number'
    isValid = false
  }

  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true
  try {
    await api.put(`/users/${props.user.id}`, {
      fullname: form.fullname,
      phone_number: form.phone_number,
      email: form.email || undefined
    })
    
    notificationStore.success('Success', 'User updated successfully')
    emit('updated')
    close()
  } catch (error) {
    notificationStore.error('Error', error.response?.data?.message || 'Failed to update user')
  } finally {
    loading.value = false
  }
}

const close = () => {
  emit('close')
}

// Close modal on escape key
const handleEscape = (e) => {
  if (e.key === 'Escape') close()
}

watch(show, (newValue) => {
  if (newValue) {
    document.addEventListener('keydown', handleEscape)
  } else {
    document.removeEventListener('keydown', handleEscape)
  }
})
</script>
