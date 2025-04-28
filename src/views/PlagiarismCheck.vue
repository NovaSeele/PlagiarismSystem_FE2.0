<template>
  <div class="flex-1 p-3 md:p-4 max-w-7xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Kiểm tra đạo văn</h1>

    <!-- Queue panel -->
    <div v-if="queuedDocuments.length > 0" class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold">
          Tài liệu trong hàng đợi ({{ queuedDocuments.length }})
        </h2>
        <div class="flex space-x-3">
          <button
            @click="checkQueuedDocuments"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isLoading"
          >
            <span v-if="isLoading">Đang xử lý...</span>
            <span v-else>Kiểm tra tài liệu đã chọn</span>
          </button>
          <button
            @click="clearQueue"
            class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isLoading"
          >
            Xóa hàng đợi
          </button>
        </div>
      </div>

      <div class="overflow-y-auto max-h-64 border rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tên tài liệu
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Người tải lên
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Ngày tải
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(doc, index) in queuedDocuments" :key="index">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ doc.filename }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ doc.user }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(doc.upload_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button @click="removeFromQueue(index)" class="text-red-600 hover:text-red-800">
                  Xóa
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty queue notification -->
    <div v-else class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="flex flex-col items-center justify-center py-6">
        <div class="bg-blue-50 rounded-full p-4 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-10 w-10 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 class="text-lg font-semibold text-center mb-2">Chưa có tài liệu nào trong hàng đợi</h2>
        <p class="text-gray-600 text-center mb-4">
          Vui lòng chọn các tài liệu từ trang Tài liệu để thêm vào hàng đợi kiểm tra đạo văn.
        </p>
        <router-link
          to="/documents"
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Đi đến trang Tài liệu
        </router-link>
      </div>
    </div>

    <!-- Check all documents panel -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="flex justify-between items-center">
        <h2 class="text-lg font-semibold">Kiểm tra toàn bộ cơ sở dữ liệu</h2>
        <button
          @click="checkAllDocuments"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isLoading"
        >
          <span v-if="isLoading">Đang xử lý...</span>
          <span v-else>Kiểm tra toàn bộ tài liệu</span>
        </button>
      </div>
    </div>

    <!-- Progress display panel - Redesigned -->
    <div
      v-if="isLoading || progressMessages.length > 0"
      class="bg-white rounded-lg shadow p-6 mb-6"
    >
      <div class="flex justify-between items-center mb-4">
        <div class="flex items-center">
          <h2 class="text-lg font-semibold">Tiến độ xử lý</h2>
          <div v-if="isLoading && !checkCompleted" class="ml-3">
            <div class="animate-pulse flex space-x-1">
              <div class="h-2 w-2 bg-indigo-600 rounded-full"></div>
              <div class="h-2 w-2 bg-indigo-600 rounded-full"></div>
              <div class="h-2 w-2 bg-indigo-600 rounded-full"></div>
            </div>
          </div>
        </div>
        <button
          v-if="checkCompleted"
          @click="navigateToResults"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center"
        >
          <span>Đi đến trang xem kết quả</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 ml-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>

      <!-- Progress bar -->
      <div class="w-full bg-gray-200 rounded-full h-2.5 mb-4 dark:bg-gray-700">
        <div
          class="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>

      <!-- Progress messages with improved styling -->
      <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-y-auto max-h-96">
        <div v-if="progressMessages.length === 0 && isLoading" class="mb-2 flex items-center">
          <svg
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span class="text-gray-700">Đang khởi tạo quá trình phân tích...</span>
        </div>

        <div
          v-for="(message, index) in progressMessages"
          :key="index"
          class="mb-3 pb-2 border-b border-gray-100 last:border-b-0"
        >
          <div class="text-sm font-medium" :class="getMessageClass(message)">
            <div class="flex items-start">
              <span
                v-if="message.includes('Layer 1')"
                class="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mr-2 flex-shrink-0"
                >L1</span
              >
              <span
                v-else-if="message.includes('Layer 2')"
                class="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-800 text-xs font-bold mr-2 flex-shrink-0"
                >L2</span
              >
              <span
                v-else-if="message.includes('Layer 3')"
                class="inline-flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mr-2 flex-shrink-0"
                >L3</span
              >
              <span
                v-else-if="message.includes('BẮT ĐẦU')"
                class="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold mr-2 flex-shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </span>
              <span
                v-else-if="message.includes('HOÀN THÀNH')"
                class="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-800 text-xs font-bold mr-2 flex-shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              <span
                v-else-if="getPercentage(message) !== null"
                class="inline-flex items-center justify-center h-6 w-12 rounded-full bg-gray-100 text-gray-800 text-xs font-medium mr-2 flex-shrink-0"
              >
                {{ getPercentage(message) }}%
              </span>
              <span v-else class="inline-flex h-5 w-5 mr-2"></span>

              <span>{{ message }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error notification -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
      <div class="flex">
        <svg
          class="h-5 w-5 text-red-500 mr-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p class="text-red-700">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { uploadDocument } from '@/api/documents'
import { checkAllDocuments as apiCheckAllDocuments, checkDocumentsByNames } from '@/api/plagiarism'
import { saveResults } from '@/store/plagiarismResults'
import { getApiUrl, fetchNgrokUrl } from '@/api/config'

export default {
  name: 'PlagiarismCheck',
  setup() {
    const selectedFile = ref(null)
    const isLoading = ref(false)
    const error = ref(null)
    const queuedDocuments = ref([])
    const progressMessages = ref([])
    const websocket = ref(null)
    const checkCompleted = ref(false)
    const router = useRouter()
    const connectionAttempts = ref(0)
    const maxReconnectAttempts = 3
    const reconnectInterval = 2000 // 2 seconds

    // Tính phần trăm tiến độ dựa trên các thông báo
    const progressPercentage = computed(() => {
      if (progressMessages.value.length === 0) {
        return isLoading.value ? 5 : 0 // Hiển thị 5% khi mới bắt đầu
      }

      if (checkCompleted.value) return 100

      // Tìm xem hiện đang ở layer nào
      const isLayer1Done = progressMessages.value.some((m) => m.includes('Layer 1: Hoàn thành'))
      const isLayer2Done = progressMessages.value.some((m) => m.includes('Layer 2: Hoàn thành'))
      const isLayer3Started = progressMessages.value.some((m) => m.includes('Layer 3: Bắt đầu'))

      if (isLayer2Done) return 75
      if (isLayer3Started) return 60
      if (isLayer1Done) return 45

      // Check các thông báo phần trăm của từng layer
      const percentages = progressMessages.value
        .map((msg) => getPercentage(msg))
        .filter((p) => p !== null)

      if (percentages.length === 0) return 10

      // Layer 1 chiếm 40%, Layer 2 chiếm 30%, Layer 3 chiếm 30%
      if (isLayer3Started) {
        return 60 + (percentages[percentages.length - 1] / 100) * 30
      } else if (isLayer1Done) {
        return 45 + (percentages[percentages.length - 1] / 100) * 15
      } else {
        return 10 + (percentages[percentages.length - 1] / 100) * 35
      }
    })

    // Trích xuất phần trăm từ một thông báo
    const getPercentage = (message) => {
      const regex = /\((\d+(?:\.\d+)?)%\)/
      const match = message.match(regex)
      return match ? parseFloat(match[1]) : null
    }

    // Xác định class cho thông báo dựa vào nội dung
    const getMessageClass = (message) => {
      if (message.includes('HOÀN THÀNH PHÂN TÍCH ĐẠO VĂN')) {
        return 'text-green-700'
      } else if (message.includes('BẮT ĐẦU PHÂN TÍCH ĐẠO VĂN')) {
        return 'text-indigo-700'
      } else if (message.includes('Layer 1')) {
        return 'text-blue-700'
      } else if (message.includes('Layer 2')) {
        return 'text-green-700'
      } else if (message.includes('Layer 3')) {
        return 'text-purple-700'
      } else {
        return 'text-gray-700'
      }
    }

    // Handle file change for uploading documents
    const handleFileChange = (event) => {
      const file = event.target.files[0]
      if (file && file.type === 'application/pdf') {
        selectedFile.value = file
        error.value = null
      } else {
        error.value = 'Vui lòng chọn tệp PDF hợp lệ'
        selectedFile.value = null
      }
    }

    // Save progress messages to localStorage
    const saveProgressMessages = () => {
      localStorage.setItem('plagiarismProgressMessages', JSON.stringify(progressMessages.value))
    }

    // Load progress messages from localStorage
    const loadProgressMessages = () => {
      const savedMessages = localStorage.getItem('plagiarismProgressMessages')
      if (savedMessages) {
        progressMessages.value = JSON.parse(savedMessages)

        // Check if the last message indicates completion
        const lastMessage = progressMessages.value[progressMessages.value.length - 1]
        if (lastMessage && lastMessage.includes('HOÀN THÀNH PHÂN TÍCH ĐẠO VĂN')) {
          checkCompleted.value = true
        }
      }
    }

    // Watch for changes to progress messages and save to localStorage
    watch(progressMessages, saveProgressMessages, { deep: true })

    // Function to ensure WebSocket is connected before proceeding
    const ensureWebSocketConnected = async () => {
      // First try to fetch latest ngrok URL
      await fetchNgrokUrl()

      return new Promise((resolve) => {
        // If WebSocket is already open, resolve immediately
        if (websocket.value && websocket.value.readyState === WebSocket.OPEN) {
          console.log('WebSocket already connected, proceeding...')
          return resolve()
        }

        // Otherwise, create a new connection
        console.log('Establishing new WebSocket connection...')
        const ws = connectWebSocket()

        // Set up onopen handler to resolve the promise when connected
        ws.onopen = () => {
          console.log('WebSocket connection established, proceeding...')
          resolve()
        }

        // Handle connection error
        ws.onerror = (error) => {
          console.error('WebSocket connection error:', error)
          resolve() // Still resolve to continue the process even if connection fails
        }
      })
    }

    // Function to connect to the WebSocket server with reconnect logic
    const connectWebSocket = () => {
      // Create WebSocket connection
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      // Get API URL from our config system instead of env var directly
      const wsHost = getApiUrl().replace(/^https?:\/\//, '')
      const wsUrl = wsProtocol + '//' + wsHost + '/ws'

      console.log('Connecting to WebSocket at:', wsUrl)

      websocket.value = new WebSocket(wsUrl)

      websocket.value.onopen = () => {
        console.log('WebSocket connection established')
        connectionAttempts.value = 0 // Reset connection attempts on success
      }

      websocket.value.onmessage = (event) => {
        progressMessages.value.push(event.data)

        // Check for completion message
        if (event.data.includes('HOÀN THÀNH PHÂN TÍCH ĐẠO VĂN')) {
          checkCompleted.value = true
        }

        // Auto-scroll to the bottom of the progress panel
        setTimeout(() => {
          const progressPanel = document.querySelector('.max-h-96')
          if (progressPanel) {
            progressPanel.scrollTop = progressPanel.scrollHeight
          }
        }, 10)
      }

      websocket.value.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      websocket.value.onclose = (event) => {
        console.log(`WebSocket connection closed: ${event.code} ${event.reason}`)

        // Attempt to reconnect if not completed and still loading
        if (
          !checkCompleted.value &&
          isLoading.value &&
          connectionAttempts.value < maxReconnectAttempts
        ) {
          connectionAttempts.value++
          console.log(
            `Attempting to reconnect (${connectionAttempts.value}/${maxReconnectAttempts})...`,
          )

          setTimeout(() => {
            connectWebSocket()
          }, reconnectInterval)
        }
      }

      return websocket.value
    }

    // Function to close the WebSocket connection
    const closeWebSocket = () => {
      if (websocket.value && websocket.value.readyState === WebSocket.OPEN) {
        websocket.value.close()
      }
    }

    // Function to check plagiarism for queued documents
    const checkQueuedDocuments = async () => {
      if (queuedDocuments.value.length === 0) return

      isLoading.value = true
      error.value = null
      progressMessages.value = [] // Clear previous messages
      checkCompleted.value = false // Reset completion state

      try {
        // First ensure WebSocket is connected before proceeding
        await ensureWebSocketConnected()

        // Extract filenames without .pdf extension
        const filenames = queuedDocuments.value.map((doc) => {
          const filename = doc.filename
          // Remove .pdf extension if present
          return filename.endsWith('.pdf') ? filename.substring(0, filename.length - 4) : filename
        })

        // Add artificial delay to make sure WebSocket is fully ready
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Call the real API
        const results = await checkDocumentsByNames(filenames)

        // Save results in store
        saveResults(results, 'queue')
      } catch (err) {
        console.error('Error checking plagiarism for queued documents:', err)
        error.value = 'Có lỗi xảy ra khi kiểm tra đạo văn. Vui lòng thử lại sau.'
      } finally {
        isLoading.value = false
      }
    }

    // Function to check plagiarism for all documents
    const checkAllDocuments = async () => {
      isLoading.value = true
      error.value = null
      progressMessages.value = [] // Clear previous messages
      checkCompleted.value = false // Reset completion state

      try {
        // First ensure WebSocket is connected before proceeding
        await ensureWebSocketConnected()

        // Add artificial delay to make sure WebSocket is fully ready
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Call the real API for checking all documents
        const results = await apiCheckAllDocuments()

        // Save results in store
        saveResults(results, 'all')
      } catch (err) {
        console.error('Error checking plagiarism for all documents:', err)
        error.value = 'Có lỗi xảy ra khi kiểm tra đạo văn. Vui lòng thử lại sau.'
      } finally {
        isLoading.value = false
      }
    }

    // Function to navigate to results page
    const navigateToResults = () => {
      router.push('/view-results')
    }

    // Function to remove a document from the queue
    const removeFromQueue = (index) => {
      queuedDocuments.value.splice(index, 1)
      // Update localStorage
      localStorage.setItem('plagiarismCheckQueue', JSON.stringify(queuedDocuments.value))
    }

    // Function to clear the queue
    const clearQueue = () => {
      queuedDocuments.value = []
      localStorage.removeItem('plagiarismCheckQueue')
    }

    // Format date
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }

    // Load queued documents from localStorage
    const loadQueuedDocuments = () => {
      const queueData = localStorage.getItem('plagiarismCheckQueue')
      if (queueData) {
        queuedDocuments.value = JSON.parse(queueData)
      }
    }

    // Lifecycle hooks
    onMounted(() => {
      loadQueuedDocuments()
      loadProgressMessages()

      // Try to fetch and update the ngrok URL when the component is mounted
      fetchNgrokUrl()
        .then((url) => {
          if (url) {
            console.log('Successfully retrieved ngrok URL:', url)
          }
        })
        .catch((err) => {
          console.error('Failed to fetch ngrok URL on mount:', err)
        })
    })

    onBeforeUnmount(() => {
      closeWebSocket()
    })

    return {
      selectedFile,
      isLoading,
      error,
      queuedDocuments,
      progressMessages,
      checkCompleted,
      progressPercentage,
      getPercentage,
      getMessageClass,
      handleFileChange,
      checkPlagiarism: () => {}, // This method isn't used but kept for reference
      checkQueuedDocuments,
      checkAllDocuments,
      navigateToResults,
      removeFromQueue,
      clearQueue,
      formatDate,
      connectionAttempts,
    }
  },
}
</script>
