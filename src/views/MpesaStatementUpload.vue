<template>
  <div class="mpesa-statement-upload">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-800 mb-6">Upload M-Pesa Statement</h1>
        
        <!-- Credit Subject Selection -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Select Credit Subject
          </label>
          <select 
            v-model="selectedCreditSubject" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="loading"
          >
            <option value="">Choose a credit subject...</option>
            <option 
              v-for="subject in creditSubjects" 
              :key="subject.id" 
              :value="subject.id"
            >
              {{ subject.full_name }} ({{ subject.email }})
            </option>
          </select>
        </div>

        <!-- File Upload Area -->
        <div 
          class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
          :class="{ 'border-blue-500 bg-blue-50': isDragging }"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
        >
          <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          
          <div class="mb-4">
            <p class="text-lg text-gray-600 mb-2">
              Drag and drop your M-Pesa statement PDF here, or
            </p>
            <button 
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              @click="$refs.fileInput.click()"
              :disabled="loading"
            >
              Browse Files
            </button>
          </div>
          
          <input 
            ref="fileInput"
            type="file"
            accept=".pdf"
            class="hidden"
            @change="handleFileSelect"
          />
          
          <p class="text-sm text-gray-500">
            Only PDF files are supported. Maximum file size: 10MB
          </p>
        </div>

        <!-- Selected File -->
        <div v-if="selectedFile" class="mt-6 p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <svg class="h-8 w-8 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <div>
                <p class="font-medium text-gray-900">{{ selectedFile.name }}</p>
                <p class="text-sm text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
              </div>
            </div>
            <button 
              class="text-red-600 hover:text-red-800"
              @click="removeFile"
              :disabled="loading"
            >
              Remove
            </button>
          </div>
        </div>

        <!-- Upload Button -->
        <div class="mt-6">
          <button 
            class="w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            @click="uploadStatement"
            :disabled="!selectedFile || !selectedCreditSubject || loading"
          >
            <span v-if="loading" class="flex items-center justify-center">
              <svg class="animate-spin h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
            <span v-else>Upload & Process Statement</span>
          </button>
        </div>

        <!-- Results -->
        <div v-if="uploadResult" class="mt-6">
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-green-800 mb-2">Upload Successful!</h3>
            <div class="space-y-2 text-sm text-green-700">
              <p><strong>Statement ID:</strong> {{ uploadResult.statement_id }}</p>
              <p><strong>Customer Name:</strong> {{ uploadResult.statement_summary.customer_name }}</p>
              <p><strong>Mobile Number:</strong> {{ uploadResult.statement_summary.mobile_number }}</p>
              <p><strong>Statement Period:</strong> {{ uploadResult.statement_summary.statement_period }}</p>
              <p><strong>Transactions Found:</strong> {{ uploadResult.transactions_count }}</p>
              <p><strong>Total Paid In:</strong> Ksh {{ uploadResult.statement_summary.total_paid_in }}</p>
              <p><strong>Total Paid Out:</strong> Ksh {{ uploadResult.statement_summary.total_paid_out }}</p>
            </div>
            
            <!-- New Credit Score -->
            <div v-if="uploadResult.new_credit_score" class="mt-4 pt-4 border-t border-green-200">
              <h4 class="font-semibold text-green-800 mb-2">Updated Credit Score</h4>
              <div class="bg-white rounded p-3">
                <div class="flex justify-between items-center">
                  <span class="text-2xl font-bold text-green-600">{{ uploadResult.new_credit_score.score }}</span>
                  <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {{ uploadResult.new_credit_score.category }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 class="text-lg font-semibold text-red-800 mb-2">Error</h3>
          <p class="text-red-700">{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'

export default {
  name: 'MpesaStatementUpload',
  setup() {
    const selectedCreditSubject = ref('')
    const selectedFile = ref(null)
    const isDragging = ref(false)
    const loading = ref(false)
    const creditSubjects = ref([])
    const uploadResult = ref(null)
    const error = ref('')

    // Load credit subjects
    const loadCreditSubjects = async () => {
      try {
        const response = await api.get('/credit-subjects')
        creditSubjects.value = response.data  // API returns the list directly
      } catch (err) {
        console.error('Error loading credit subjects:', err)
        error.value = 'Failed to load credit subjects'
      }
    }

    // File handling
    const handleFileSelect = (event) => {
      const file = event.target.files[0]
      if (file) {
        validateAndSetFile(file)
      }
    }

    const handleDrop = (event) => {
      isDragging.value = false
      const file = event.dataTransfer.files[0]
      if (file) {
        validateAndSetFile(file)
      }
    }

    const validateAndSetFile = (file) => {
      // Validate file type
      if (file.type !== 'application/pdf') {
        error.value = 'Only PDF files are supported'
        return
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        error.value = 'File size must be less than 10MB'
        return
      }

      selectedFile.value = file
      error.value = ''
    }

    const removeFile = () => {
      selectedFile.value = null
      uploadResult.value = null
      error.value = ''
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    // Upload statement
    const uploadStatement = async () => {
      if (!selectedFile.value || !selectedCreditSubject.value) {
        error.value = 'Please select a credit subject and file'
        return
      }

      loading.value = true
      error.value = ''
      uploadResult.value = null

      try {
        const formData = new FormData()
        formData.append('file', selectedFile.value)
        formData.append('credit_subject_id', selectedCreditSubject.value)

        const response = await api.post('/mpesa-statements/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        uploadResult.value = response.data.data
        selectedFile.value = null
        
        // Upload successful - results are displayed in the template
        
      } catch (err) {
        console.error('Upload error:', err)
        error.value = err.response?.data?.message || 'Upload failed. Please try again.'
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadCreditSubjects()
    })

    return {
      selectedCreditSubject,
      selectedFile,
      isDragging,
      loading,
      creditSubjects,
      uploadResult,
      error,
      handleFileSelect,
      handleDrop,
      removeFile,
      formatFileSize,
      uploadStatement
    }
  }
}
</script>

<style scoped>
.mpesa-statement-upload {
  min-height: 100vh;
  background-color: #f9fafb;
}

.container {
  max-width: 1200px;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
