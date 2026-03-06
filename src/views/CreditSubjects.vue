<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Clients</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">Manage clients and their information</p>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name, email, or national ID..."
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        <button
          @click="showCreateModal = true"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus class="w-4 h-4 mr-2" />
          Add Client
        </button>
      </div>
    </div>

    <!-- Clients Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                National ID
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Phone
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="loading">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                Loading...
              </td>
            </tr>
            <tr v-else-if="filteredSubjects.length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                No clients found
              </td>
            </tr>
            <tr v-for="subject in filteredSubjects" :key="subject.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                {{ subject.full_name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ subject.email }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ subject.national_id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ subject.phone_number }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                <div class="flex space-x-2">
                  <router-link
                    :to="`/clients/${subject.id}`"
                    class="text-primary-600 dark:text-primary-400 hover:text-primary-900"
                  >
                    <Eye class="w-4 h-4" />
                  </router-link>
                  <router-link
                    :to="`/credit-scores?subject=${subject.id}`"
                    class="text-green-600 dark:text-green-400 hover:text-green-900"
                  >
                    <Calculator class="w-4 h-4" />
                  </router-link>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Add Client</h2>
        <form @submit.prevent="createCreditSubject" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <input
              v-model="createForm.full_name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              v-model="createForm.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">National ID</label>
            <input
              v-model="createForm.national_id"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
            <input
              v-model="createForm.phone_number"
              type="tel"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div class="flex space-x-3">
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Create
            </button>
            <button
              type="button"
              @click="showCreateModal = false"
              class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Eye, Calculator } from 'lucide-vue-next'
import api from '@/utils/api'
import { useCreditStore } from '@/stores/credit'

const creditStore = useCreditStore()
const loading = ref(false)
const searchQuery = ref('')
const showCreateModal = ref(false)
const creditSubjects = ref([])

const createForm = ref({
  full_name: '',
  email: '',
  national_id: '',
  phone_number: ''
})

const filteredSubjects = computed(() => {
  if (!searchQuery.value) return creditStore.clients || []
  
  const query = searchQuery.value.toLowerCase()
  return (creditStore.clients || []).filter(subject => 
    subject.full_name.toLowerCase().includes(query) ||
    subject.email.toLowerCase().includes(query) ||
    subject.national_id.toLowerCase().includes(query) ||
    subject.phone_number.toLowerCase().includes(query)
  )
})

const fetchClients = async () => {
  loading.value = true
  try {
    const response = await api.get('/credit-subjects')
    creditStore.clients = response.data
  } catch (error) {
    console.error('Error fetching clients:', error)
  } finally {
    loading.value = false
  }
}

const createCreditSubject = async () => {
  try {
    await api.post('/credit-subjects', createForm.value)
    showCreateModal.value = false
    createForm.value = {
      full_name: '',
      email: '',
      national_id: '',
      phone_number: ''
    }
    await fetchClients()
  } catch (error) {
    console.error('Error creating client:', error)
  }
}

onMounted(() => {
  fetchClients()
})
</script>
