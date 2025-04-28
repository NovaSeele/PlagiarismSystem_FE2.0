<template>
  <div>
    <button
      @click="isModalOpen = true"
      class="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      title="Cập nhật URL Ngrok"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
    </button>

    <!-- Modal -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div class="p-4 border-b">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-900">Cập nhật URL Ngrok</h3>
            <button @click="isModalOpen = false" class="text-gray-400 hover:text-gray-600">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="p-4">
          <!-- Current URL -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">URL hiện tại</label>
            <div
              class="flex items-center bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-gray-600"
            >
              {{ currentUrl }}
            </div>
          </div>

          <!-- New URL input -->
          <div class="mb-4">
            <label for="ngrokUrl" class="block text-sm font-medium text-gray-700 mb-1"
              >URL mới</label
            >
            <input
              id="ngrokUrl"
              v-model="newUrl"
              type="text"
              placeholder="https://xxxx-xx-xx-xx-xxx.ngrok-free.app"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
            />
            <p class="mt-1 text-xs text-gray-500">
              URL Ngrok thay đổi mỗi khi khởi động lại, bạn có thể cập nhật thủ công ở đây
            </p>
          </div>

          <!-- Auto-fetch button -->
          <div class="mb-4">
            <button
              @click="fetchLatestUrl"
              :disabled="isFetching"
              class="w-full bg-blue-50 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
            >
              <span v-if="isFetching">Đang lấy URL mới...</span>
              <span v-else>Tự động lấy URL mới nhất</span>
            </button>
          </div>

          <!-- Success/Error message -->
          <div v-if="message" :class="messageClass" class="px-3 py-2 rounded-md mb-4 text-sm">
            {{ message }}
          </div>
        </div>

        <div class="p-4 border-t flex justify-end space-x-3">
          <button
            @click="isModalOpen = false"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Hủy
          </button>
          <button
            @click="updateUrl"
            :disabled="!isValidUrl"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cập nhật
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { getApiUrl, setApiUrl, fetchNgrokUrl } from '@/api/config'

export default {
  name: 'NgrokUrlUpdater',

  setup() {
    const isModalOpen = ref(false)
    const currentUrl = ref(getApiUrl())
    const newUrl = ref('')
    const message = ref('')
    const messageType = ref('') // 'success' or 'error'
    const isFetching = ref(false)

    // Reset new URL to current URL when modal opens
    watch(isModalOpen, (value) => {
      if (value) {
        currentUrl.value = getApiUrl()
        newUrl.value = currentUrl.value
        message.value = ''
      }
    })

    // Validate URL format
    const isValidUrl = computed(() => {
      if (!newUrl.value) return false
      try {
        new URL(newUrl.value)
        return true
      } catch (e) {
        return false
      }
    })

    // CSS class for message
    const messageClass = computed(() => {
      return messageType.value === 'success'
        ? 'bg-green-50 text-green-700'
        : 'bg-red-50 text-red-700'
    })

    // Fetch latest URL from backend
    const fetchLatestUrl = async () => {
      isFetching.value = true
      message.value = ''

      try {
        const url = await fetchNgrokUrl()
        if (url) {
          newUrl.value = url
          message.value = 'Đã lấy URL mới thành công'
          messageType.value = 'success'
        } else {
          message.value = 'Không thể lấy URL từ máy chủ'
          messageType.value = 'error'
        }
      } catch (error) {
        message.value = `Lỗi: ${error.message}`
        messageType.value = 'error'
      } finally {
        isFetching.value = false
      }
    }

    // Update the API URL
    const updateUrl = () => {
      if (!isValidUrl.value) {
        message.value = 'URL không hợp lệ'
        messageType.value = 'error'
        return
      }

      try {
        setApiUrl(newUrl.value)
        currentUrl.value = newUrl.value
        message.value = 'Đã cập nhật URL thành công. Vui lòng tải lại trang để áp dụng.'
        messageType.value = 'success'

        // Auto reload after a short delay
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } catch (error) {
        message.value = `Lỗi khi cập nhật URL: ${error.message}`
        messageType.value = 'error'
      }
    }

    return {
      isModalOpen,
      currentUrl,
      newUrl,
      message,
      messageClass,
      isValidUrl,
      isFetching,
      fetchLatestUrl,
      updateUrl,
    }
  },
}
</script>
