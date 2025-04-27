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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { uploadDocument } from '@/api/documents'
import { checkAllDocuments as apiCheckAllDocuments, checkDocumentsByNames } from '@/api/plagiarism'
import { saveResults } from '@/store/plagiarismResults'

export default {
  name: 'PlagiarismCheck',
  setup() {
    const selectedFile = ref(null)
    const isLoading = ref(false)
    const error = ref(null)
    const queuedDocuments = ref([])
    const router = useRouter()

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

    const checkPlagiarism = async () => {
      if (!selectedFile.value) return

      isLoading.value = true
      error.value = null

      try {
        // Upload the document first
        await uploadDocument(selectedFile.value)

        // Redirect to results page
        router.push('/view-results')
      } catch (err) {
        console.error('Error checking plagiarism:', err)
        error.value = 'Có lỗi xảy ra khi kiểm tra đạo văn. Vui lòng thử lại sau.'
      } finally {
        isLoading.value = false
      }
    }

    const loadQueuedDocuments = () => {
      const queueData = localStorage.getItem('plagiarismCheckQueue')
      if (queueData) {
        queuedDocuments.value = JSON.parse(queueData)
      }
    }

    const checkQueuedDocuments = async () => {
      if (queuedDocuments.value.length === 0) return

      isLoading.value = true
      error.value = null

      try {
        // Extract filenames without .pdf extension
        const filenames = queuedDocuments.value.map((doc) => {
          const filename = doc.filename
          // Remove .pdf extension if present
          return filename.endsWith('.pdf') ? filename.substring(0, filename.length - 4) : filename
        })

        // Call the real API
        const results = await checkDocumentsByNames(filenames)

        // Save results in store
        saveResults(results, 'queue')

        // Navigate to results page
        router.push('/view-results')
      } catch (err) {
        console.error('Error checking plagiarism for queued documents:', err)
        error.value = 'Có lỗi xảy ra khi kiểm tra đạo văn. Vui lòng thử lại sau.'
      } finally {
        isLoading.value = false
      }
    }

    const checkAllDocuments = async () => {
      isLoading.value = true
      error.value = null

      try {
        // Call the real API for checking all documents
        const results = await apiCheckAllDocuments()

        // Save results in store
        saveResults(results, 'all')

        // Navigate to results page
        router.push('/view-results')
      } catch (err) {
        console.error('Error checking plagiarism for all documents:', err)
        error.value = 'Có lỗi xảy ra khi kiểm tra đạo văn. Vui lòng thử lại sau.'
      } finally {
        isLoading.value = false
      }
    }

    const removeFromQueue = (index) => {
      queuedDocuments.value.splice(index, 1)
      // Update localStorage
      localStorage.setItem('plagiarismCheckQueue', JSON.stringify(queuedDocuments.value))
    }

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

    onMounted(() => {
      loadQueuedDocuments()
    })

    return {
      selectedFile,
      isLoading,
      error,
      queuedDocuments,
      handleFileChange,
      checkPlagiarism,
      checkQueuedDocuments,
      checkAllDocuments,
      removeFromQueue,
      clearQueue,
      formatDate,
    }
  },
}
</script>
