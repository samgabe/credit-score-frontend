<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">CSV Upload</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">Upload CSV files to import credit data</p>
    </div>

    <!-- Upload Options -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Upload Options</h3>
      <div class="space-y-4">
        <div class="flex items-center">
          <input
            id="syncToDb"
            v-model="syncToDb"
            type="checkbox"
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label for="syncToDb" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Import data to database (creates/updates records)
          </label>
        </div>
        <div class="flex items-center">
          <input
            id="validateOnly"
            v-model="validateOnly"
            type="checkbox"
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label for="validateOnly" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Validate only (don't import to database)
          </label>
        </div>
      </div>
    </div>

    <!-- Upload Area -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <div
        class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-primary-500 transition-colors"
        :class="{ 'border-primary-500 bg-primary-50 dark:bg-primary-900/20': isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
      >
        <Upload class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Drop CSV files here or click to browse
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Supported files: Credit Subjects, Repayments, M-Pesa Transactions, Payments, Fines
        </p>
        <input
          ref="fileInput"
          type="file"
          accept=".csv"
          multiple
          class="hidden"
          @change="handleFileSelect"
        />
        <button
          @click="$refs.fileInput.click()"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Select Files
        </button>
      </div>
    </div>

    <!-- File List -->
    <div v-if="files.length > 0" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Selected Files</h3>
      <div class="space-y-3">
        <div
          v-for="(file, index) in files"
          :key="index"
          class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <FileText class="w-5 h-5 text-gray-400" />
            <div>
              <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ file.name }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">{{ formatFileSize(file.size) }}</div>
              <div v-if="file.analysis" class="text-xs text-green-600 dark:text-green-400">
                Detected: {{ file.analysis.csv_type?.replace('_', ' ').toUpperCase() }}
              </div>
            </div>
          </div>
          <button
            @click="removeFile(index)"
            class="text-red-600 dark:text-red-400 hover:text-red-900"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div class="mt-4 flex space-x-3">
        <button
          @click="uploadFiles"
          :disabled="uploading || files.length === 0"
          class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div v-if="uploading" class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
          <span v-else>Process Files</span>
        </button>
        <button
          @click="clearFiles"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          Clear All
        </button>
      </div>
    </div>

    <!-- Analysis Results -->
    <div v-if="analysisResults.length > 0" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Analysis Results</h3>
      <div class="space-y-4">
        <div
          v-for="(result, index) in analysisResults"
          :key="index"
          class="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
        >
          <div class="flex items-center justify-between mb-2">
            <h4 class="font-medium text-gray-900 dark:text-gray-100">{{ result.filename }}</h4>
            <span
              :class="{
                'bg-green-100 text-green-800': result.status === 'validation_passed',
                'bg-red-100 text-red-800': result.status === 'validation_failed'
              }"
              class="px-2 py-1 text-xs font-medium rounded-full"
            >
              {{ result.status.replace('_', ' ').toUpperCase() }}
            </span>
          </div>
          
          <div v-if="result.analysis" class="space-y-2">
            <div class="text-sm text-gray-600 dark:text-gray-400">
              <strong>Detected Type:</strong> {{ result.analysis.csv_type?.replace('_', ' ').toUpperCase() }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              <strong>Rows:</strong> {{ result.analysis.stats?.total_rows || 0 }}
            </div>
            <div v-if="result.analysis.column_mapping" class="text-sm text-gray-600 dark:text-gray-400">
              <strong>Column Mapping:</strong>
              <div class="mt-1 grid grid-cols-2 gap-1 text-xs">
                <div v-for="(csvField, dbField) in result.analysis.column_mapping" :key="dbField" class="flex">
                  <span class="font-medium">{{ dbField }}:</span>
                  <span class="ml-1 text-gray-500">{{ csvField }}</span>
                </div>
              </div>
            </div>
            <div v-if="result.analysis.warnings?.length > 0" class="text-sm text-yellow-600 dark:text-yellow-400">
              <strong>Warnings:</strong>
              <ul class="mt-1 ml-4 list-disc">
                <li v-for="warning in result.analysis.warnings.slice(0, 3)" :key="warning">{{ warning }}</li>
                <li v-if="result.analysis.warnings.length > 3">... and {{ result.analysis.warnings.length - 3 }} more</li>
              </ul>
            </div>
            <div v-if="result.analysis.errors?.length > 0" class="text-sm text-red-600 dark:text-red-400">
              <strong>Errors:</strong>
              <ul class="mt-1 ml-4 list-disc">
                <li v-for="error in result.analysis.errors.slice(0, 3)" :key="error">{{ error }}</li>
                <li v-if="result.analysis.errors.length > 3">... and {{ result.analysis.errors.length - 3 }} more</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload History -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Processing History</h3>
      <div v-if="uploadHistory.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
        No processing history available
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="upload in uploadHistory"
          :key="upload.id"
          class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <div
              :class="{
                'bg-green-100 text-green-600': upload.status === 'completed',
                'bg-red-100 text-red-600': upload.status === 'failed',
                'bg-yellow-100 text-yellow-600': upload.status === 'processing'
              }"
              class="p-2 rounded-full"
            >
              <CheckCircle v-if="upload.status === 'completed'" class="w-4 h-4" />
              <X v-else-if="upload.status === 'failed'" class="w-4 h-4" />
              <div v-else class="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </div>
            <div>
              <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ upload.filename }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">{{ new Date(upload.timestamp).toLocaleString() }}</div>
              <div v-if="upload.records_processed" class="text-xs text-gray-500 dark:text-gray-400">
                {{ upload.records_processed }} records processed
              </div>
              <div v-if="upload.database_sync" class="text-xs text-green-600 dark:text-green-400">
                Database: {{ upload.database_sync.inserted }} inserted, {{ upload.database_sync.updated }} updated
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Upload, FileText, X, CheckCircle } from 'lucide-vue-next'
import api from '@/utils/api'

// State
const files = ref([])
const uploading = ref(false)
const syncToDb = ref(false)
const validateOnly = ref(false)
const analysisResults = ref([])
const uploadHistory = ref([])
const isDragging = ref(false)

// Methods
const handleDrop = (event) => {
  event.preventDefault()
  isDragging.value = false
  
  const droppedFiles = Array.from(event.dataTransfer.files).filter(file => 
    file.name.toLowerCase().endsWith('.csv')
  )
  
  files.value = [...files.value, ...droppedFiles]
}

const handleFileSelect = (event) => {
  const selectedFiles = Array.from(event.target.files)
  files.value = [...files.value, ...selectedFiles]
}

const removeFile = (index) => {
  files.value.splice(index, 1)
}

const clearFiles = () => {
  files.value = []
  analysisResults.value = []
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const analyzeFile = async (file) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/csv/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    return response.data
  } catch (error) {
    console.error('Analysis error:', error)
    throw error
  }
}

const uploadFiles = async () => {
  if (files.value.length === 0) return

  uploading.value = true
  analysisResults.value = []
  
  try {
    // First analyze all files
    for (const file of files.value) {
      try {
        const analysis = await analyzeFile(file)
        file.analysis = analysis.analysis
        
        analysisResults.value.push({
          filename: file.name,
          status: analysis.status,
          analysis: analysis.analysis,
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        analysisResults.value.push({
          filename: file.name,
          status: 'validation_failed',
          analysis: { errors: [error.response?.data?.detail?.message || 'Analysis failed'] },
          timestamp: new Date().toISOString()
        })
      }
    }

    // Check if any files failed validation
    const failedFiles = analysisResults.value.filter(result => result.status === 'validation_failed')
    if (failedFiles.length > 0 && !validateOnly.value) {
      console.warn('Some files failed validation:', failedFiles)
    }

    // Process files if not validate-only
    if (!validateOnly.value) {
      for (const file of files.value) {
        try {
          const formData = new FormData()
          formData.append('file', file)
          
          const params = new URLSearchParams()
          if (syncToDb.value) params.append('sync_to_db', 'true')
          if (validateOnly.value) params.append('validate_only', 'true')
          
          const response = await api.post(`/csv/upload?${params.toString()}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          
          // Add to history
          uploadHistory.value.unshift({
            id: Date.now(),
            filename: file.name,
            timestamp: new Date().toISOString(),
            status: 'completed',
            records_processed: response.data.rows_processed || 0,
            database_sync: response.data.database_sync || null
          })
          
        } catch (error) {
          console.error('Upload error:', error)
          
          // Add failed upload to history
          uploadHistory.value.unshift({
            id: Date.now(),
            filename: file.name,
            timestamp: new Date().toISOString(),
            status: 'failed',
            records_processed: 0
          })
        }
      }
    }
    
    clearFiles()
  } catch (error) {
    console.error('Processing error:', error)
  } finally {
    uploading.value = false
  }
}
</script>
