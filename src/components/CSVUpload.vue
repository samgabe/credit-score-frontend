<template>
  <div class="csv-upload-container">
    <div class="upload-section">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        <Upload class="w-5 h-5 inline mr-2" />
        Upload CSV Files
      </h3>
      
      <!-- File Type Selection -->
      <div class="mb-4">
        <label class="block text-sm font-semibold mb-2" style="color: #111827;">
          Select File Type
        </label>
        <select 
          v-model="selectedFileType" 
          class="input-field !bg-white !border-gray-300"
          style="color: #111827; background-color: #ffffff;"
        >
          <option value="" class="text-gray-600">Choose file type...</option>
          <option 
            v-for="(config, type) in csvTemplates" 
            :key="type" 
            :value="type"
            class="text-gray-900"
          >
            {{ formatFileType(type) }}
          </option>
        </select>
      </div>

      <!-- Template Info -->
      <div v-if="selectedFileType && csvTemplates[selectedFileType]" class="mb-4 p-4 rounded-lg border shadow-sm" style="background-color: #ffffff; border-color: #e5e7eb;">
        <h4 class="font-semibold mb-2" style="color: #111827;">Required Headers:</h4>
        <div class="text-sm" style="color: #1f2937;">
          <p><strong>Required:</strong> {{ csvTemplates[selectedFileType].required_headers.join(', ') }}</p>
          <p v-if="csvTemplates[selectedFileType].optional_headers.length">
            <strong>Optional:</strong> {{ csvTemplates[selectedFileType].optional_headers.join(', ') }}
          </p>
        </div>
      </div>

      <!-- File Upload Area -->
      <div 
        class="upload-area"
        :class="{ 'drag-over': isDragOver }"
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @drop.prevent="handleDrop"
      >
        <input
          ref="fileInput"
          type="file"
          accept=".csv"
          @change="handleFileSelect"
          class="hidden"
        />
        
        <div class="upload-content">
          <Upload class="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p class="text-center mb-2" style="color: #4b5563;">
            Drag and drop your CSV file here, or
          </p>
          <button
            @click="$refs.fileInput.click()"
            class="btn-secondary"
            :disabled="!selectedFileType || uploading"
          >
            Browse Files
          </button>
        </div>
      </div>

      <!-- Selected File Info -->
      <div v-if="selectedFile" class="mt-4 p-4 rounded-lg border shadow-sm" style="background-color: #ffffff; border-color: #e5e7eb;">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-semibold" style="color: #111827;">{{ selectedFile.name }}</p>
            <p class="text-sm" style="color: #374151;">
              {{ formatFileSize(selectedFile.size) }} • {{ formatFileType(selectedFileType) }}
            </p>
          </div>
          <button
            @click="removeFile"
            class="text-red-600 hover:text-red-800"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Upload Button -->
      <label class="mt-4 flex items-center gap-2 text-sm" style="color: #374151;">
        <input
          v-model="syncToDb"
          type="checkbox"
          class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        Also sync uploaded rows to database
      </label>

      <button
        @click="uploadFile"
        class="btn-primary w-full mt-4"
        :disabled="!selectedFile || uploading"
      >
        <Loader v-if="uploading" class="w-4 h-4 mr-2 animate-spin" />
        <Upload v-else class="w-4 h-4 mr-2" />
        {{ uploading ? 'Uploading...' : 'Upload CSV' }}
      </button>

      <!-- Upload Result -->
      <div v-if="uploadResult" class="mt-4">
        <div 
          class="p-4 rounded-lg"
          :class="uploadResult.success ? 'bg-green-50' : 'bg-red-50'"
        >
          <div class="flex items-start">
            <CheckCircle 
              v-if="uploadResult.success" 
              class="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" 
            />
            <XCircle 
              v-else 
              class="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" 
            />
            <div>
              <p 
                class="font-medium"
                :class="uploadResult.success ? 'text-green-900' : 'text-red-900'"
              >
                {{ uploadResult.message }}
              </p>
              <div v-if="uploadResult.details" class="mt-2 text-sm">
                <p 
                  v-if="uploadResult.success"
                  class="text-green-800"
                >
                  {{ uploadResult.details.rows_processed }} rows processed
                </p>
                <p
                  v-if="uploadResult.success && uploadResult.details.db_sync"
                  class="text-green-800"
                >
                  DB sync: {{ uploadResult.details.db_sync.synced }} rows ({{ uploadResult.details.db_sync.inserted }} inserted, {{ uploadResult.details.db_sync.updated }} updated)
                </p>
                <div v-else class="text-red-800">
                  <p v-if="uploadResult.details.error">{{ uploadResult.details.error }}</p>
                  <ul v-if="uploadResult.details.validation_errors" class="list-disc list-inside">
                    <li v-for="error in uploadResult.details.validation_errors.slice(0, 5)" :key="error">
                      {{ error }}
                    </li>
                    <li v-if="uploadResult.details.validation_errors.length > 5">
                      ... and {{ uploadResult.details.validation_errors.length - 5 }} more errors
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Download Templates Section -->
    <div class="templates-section mt-6">
      <h4 class="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">
        <Download class="w-4 h-4 inline mr-2" />
        Download CSV Templates
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          v-for="(config, type) in csvTemplates"
          :key="type"
          @click="downloadTemplate(type)"
          class="btn-outline text-sm"
        >
          <Download class="w-4 h-4 mr-1" />
          {{ formatFileType(type) }} Template
        </button>
      </div>
    </div>

    <!-- Import CSV Pack -->
    <div class="templates-section mt-8 p-4 rounded-lg border" style="background-color: #ffffff; border-color: #e5e7eb;">
      <h4 class="text-md font-semibold mb-3" style="color: #111827;">
        <Upload class="w-4 h-4 inline mr-2" />
        Import CSV Pack
      </h4>
      <p class="text-sm mb-3" style="color: #4b5563;">
        Import a full dataset pack in correct order (users, repayments, M-Pesa, payments, fines).
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-semibold mb-2" style="color: #111827;">Pack Name</label>
          <select
            v-model="selectedPack"
            class="input-field !bg-white !border-gray-300"
            style="color: #111827; background-color: #ffffff;"
          >
            <option value="diverse_scope">diverse_scope</option>
            <option value="stress_scope">stress_scope</option>
            <option value="sector_personas">sector_personas</option>
          </select>
        </div>
        <div class="flex items-end">
          <label class="flex items-center gap-2 text-sm" style="color: #374151;">
            <input
              v-model="packSyncToDb"
              type="checkbox"
              class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            Also sync pack rows to database
          </label>
        </div>
      </div>

      <button
        @click="importPack"
        class="btn-primary w-full mt-4"
        :disabled="importingPack"
      >
        <Loader v-if="importingPack" class="w-4 h-4 mr-2 animate-spin" />
        <Upload v-else class="w-4 h-4 mr-2" />
        {{ importingPack ? 'Importing Pack...' : 'Import Pack' }}
      </button>

      <div v-if="packImportResult" class="mt-4 p-3 rounded-lg border" style="background-color: #f8fafc; border-color: #e2e8f0;">
        <p class="text-sm font-semibold" style="color: #111827;">
          {{ packImportResult.message }}
        </p>
        <p class="text-xs mt-1" style="color: #475569;">
          Pack: {{ packImportResult.pack_name }} • DB sync: {{ packImportResult.sync_to_db ? 'enabled' : 'disabled' }}
        </p>
        <ul class="mt-2 space-y-1 text-xs" style="color: #334155;">
          <li v-for="file in packImportResult.files || []" :key="file.file_type">
            {{ file.file_type }}: {{ file.rows_processed }} rows
            <span v-if="file.db_sync">
              ({{ file.db_sync.inserted }} inserted, {{ file.db_sync.updated }} updated)
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Upload, Download, X, CheckCircle, XCircle, Loader } from 'lucide-vue-next'
import { useNotificationStore } from '@/stores/notification'
import api from '@/utils/api'

const notificationStore = useNotificationStore()

// Reactive data
const selectedFileType = ref('')
const selectedFile = ref(null)
const isDragOver = ref(false)
const uploading = ref(false)
const uploadResult = ref(null)
const csvTemplates = ref({})
const fileInput = ref(null)
const syncToDb = ref(false)
const selectedPack = ref('diverse_scope')
const packSyncToDb = ref(true)
const importingPack = ref(false)
const packImportResult = ref(null)

// Load CSV templates on mount
onMounted(async () => {
  try {
    const response = await api.get('/csv-upload/templates')
    csvTemplates.value = response.data.templates
  } catch (error) {
    notificationStore.error('Error', 'Failed to load CSV templates')
  }
})

// File handling methods
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    uploadResult.value = null
  }
}

const handleDrop = (event) => {
  isDragOver.value = false
  const file = event.dataTransfer.files[0]
  if (file && file.type === 'text/csv') {
    selectedFile.value = file
    uploadResult.value = null
  } else {
    notificationStore.error('Error', 'Please upload a CSV file')
  }
}

const removeFile = (clearResult = true) => {
  selectedFile.value = null
  if (clearResult) {
    uploadResult.value = null
  }
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const uploadFile = async () => {
  if (!selectedFile.value || !selectedFileType.value) {
    notificationStore.error('Error', 'Please select a file type and file')
    return
  }

  uploading.value = true
  uploadResult.value = null

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    const response = await api.post(`/csv-upload/${selectedFileType.value}?sync_to_db=${syncToDb.value}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    uploadResult.value = {
      success: true,
      message: response.data.message,
      details: response.data
    }

    notificationStore.success('Success', 'CSV file uploaded successfully')
    removeFile(false)

  } catch (error) {
    const errorData = error.response?.data
    uploadResult.value = {
      success: false,
      message: errorData?.message || 'Upload failed',
      details: errorData?.details
    }
    notificationStore.error('Error', 'Failed to upload CSV file')
  } finally {
    uploading.value = false
  }
}

const downloadTemplate = async (fileType) => {
  try {
    const config = csvTemplates.value[fileType]
    const headers = [...config.required_headers, ...config.optional_headers]
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n'
    
    // Add sample data row
    if (fileType === 'users') {
      csvContent += '550e8400-e29b-41d4-a716-446655440001,John Doe,12345678,+254712345678,john.doe@example.com,2024-01-15T10:30:00,2024-01-15T10:30:00\n'
    } else if (fileType === 'repayments') {
      csvContent += '550e8400-e29b-41d4-a716-446655440002,550e8400-e29b-41d4-a716-446655440001,1000.00,LOAN001,2024-02-15T00:00:00,on_time,2024-02-14T10:30:00,0,2024-01-15T10:30:00\n'
    } else if (fileType === 'mpesa_transactions') {
      csvContent += '550e8400-e29b-41d4-a716-446655440003,550e8400-e29b-41d4-a716-446655440001,deposit,5000.00,DEP001,2024-01-20T14:30:00,2024-01-20T14:30:00\n'
    } else if (fileType === 'payments') {
      csvContent += '550e8400-e29b-41d4-a716-446655440004,550e8400-e29b-41d4-a716-446655440001,1000.00,loan_payment,completed,2024-02-14T10:30:00,2024-02-14T10:30:00\n'
    } else if (fileType === 'fines') {
      csvContent += '550e8400-e29b-41d4-a716-446655440005,550e8400-e29b-41d4-a716-446655440001,200.00,Parking fine,unpaid,2024-01-25T09:00:00,,2024-01-25T09:00:00\n'
    }

    // Download the file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = config.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    notificationStore.success('Success', 'Template downloaded successfully')
  } catch (error) {
    notificationStore.error('Error', 'Failed to download template')
  }
}

const importPack = async () => {
  importingPack.value = true
  packImportResult.value = null
  try {
    const response = await api.post(`/csv-upload/sync-pack/${selectedPack.value}?sync_to_db=${packSyncToDb.value}`)
    packImportResult.value = response.data
    notificationStore.success('Success', `Pack '${selectedPack.value}' imported successfully`)
  } catch (error) {
    const detail = error.response?.data?.detail
    const message = detail?.message || 'Failed to import CSV pack'
    notificationStore.error('Error', message)
  } finally {
    importingPack.value = false
  }
}

// Utility methods
const formatFileType = (type) => {
  return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.csv-upload-container {
  max-width: 600px;
}

.upload-area {
  border: 2px dashed #d1d5db;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;
}

.upload-area:hover {
  border-color: #6366f1;
  background-color: #f8fafc;
}

.upload-area.drag-over {
  border-color: #6366f1;
  background-color: #eef2ff;
}

:global(.dark) .upload-area {
  border-color: #4b5563;
  background-color: #1f2937;
}

:global(.dark) .upload-area:hover {
  border-color: #9ca3af;
  background-color: #111827;
}

:global(.dark) .upload-area.drag-over {
  border-color: #9ca3af;
  background-color: #111827;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.btn-primary {
  background-color: #6366f1;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  background-color: #4f46e5;
}

.btn-primary:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.btn-secondary:disabled {
  background-color: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}

:global(.dark) .btn-secondary {
  background-color: #374151;
  color: #e5e7eb;
  border-color: #4b5563;
}

:global(.dark) .btn-secondary:hover:not(:disabled) {
  background-color: #4b5563;
}

:global(.dark) .btn-secondary:disabled {
  background-color: #1f2937;
  color: #6b7280;
}

.btn-outline {
  background-color: transparent;
  color: #6366f1;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid #6366f1;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-outline:hover {
  background-color: #6366f1;
  color: white;
}

:global(.dark) .btn-outline {
  color: #d1d5db;
  border-color: #6b7280;
}

:global(.dark) .btn-outline:hover {
  background-color: #374151;
  color: #ffffff;
}

:global(.dark) .btn-primary {
  background-color: #f3f4f6;
  color: #111827;
}

:global(.dark) .btn-primary:hover:not(:disabled) {
  background-color: #e5e7eb;
}

:global(.dark) .btn-primary:disabled {
  background-color: #4b5563;
  color: #9ca3af;
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
