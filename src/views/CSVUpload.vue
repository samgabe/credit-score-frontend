<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">CSV Upload</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">Upload CSV files to import credit data</p>
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
          Supported files: users.csv, repayments.csv, mpesa_transactions.csv, payments.csv, fines.csv
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
          :disabled="uploading"
          class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div v-if="uploading" class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Uploading...
          </div>
          <span v-else>Upload Files</span>
        </button>
        <button
          @click="clearFiles"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          Clear All
        </button>
      </div>
    </div>

    <!-- Upload History -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Upload History</h3>
      <div v-if="uploadHistory.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
        No upload history available
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="upload in uploadHistory"
          :key="upload.id"
          class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <div
              class="w-2 h-2 rounded-full"
              :class="upload.status === 'completed' ? 'bg-green-500' : upload.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'"
            ></div>
            <div>
              <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ upload.filename }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ new Date(upload.timestamp).toLocaleString() }}
              </div>
            </div>
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            {{ upload.records_processed }} records
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Upload, FileText, X } from 'lucide-vue-next'
import api from '@/utils/api'

const files = ref([])
const uploading = ref(false)
const isDragging = ref(false)
const uploadHistory = ref([])

const handleDrop = (event) => {
  isDragging.value = false
  const droppedFiles = Array.from(event.dataTransfer.files)
  addFiles(droppedFiles)
}

const handleFileSelect = (event) => {
  const selectedFiles = Array.from(event.target.files)
  addFiles(selectedFiles)
}

const addFiles = (newFiles) => {
  const csvFiles = newFiles.filter(file => file.name.endsWith('.csv'))
  files.value = [...files.value, ...csvFiles]
}

const removeFile = (index) => {
  files.value.splice(index, 1)
}

const clearFiles = () => {
  files.value = []
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const uploadFiles = async () => {
  if (files.value.length === 0) return

  uploading.value = true
  
  try {
    for (const file of files.value) {
      const formData = new FormData()
      formData.append('file', file)
      
      const fileType = file.name.replace('.csv', '').toLowerCase()
      
      await api.post(`/csv-upload/${fileType}`, formData, {
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
        records_processed: Math.floor(Math.random() * 100) + 1 // Mock data
      })
    }
    
    clearFiles()
  } catch (error) {
    console.error('Upload error:', error)
    
    // Add failed upload to history
    files.value.forEach(file => {
      uploadHistory.value.unshift({
        id: Date.now(),
        filename: file.name,
        timestamp: new Date().toISOString(),
        status: 'failed',
        records_processed: 0
      })
    })
  } finally {
    uploading.value = false
  }
}
</script>
