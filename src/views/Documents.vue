<template>
  <div class="flex-1 p-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Tài liệu</h1>
      <div class="flex space-x-3">
        <button
          v-if="selectedDocuments.length > 0"
          class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          @click="confirmDelete"
        >
          <Trash2 class="w-5 h-5 mr-2" />
          Xoá {{ selectedDocuments.length }} tài liệu đã chọn
        </button>

        <!-- Add to plagiarism check - only for lecturers -->
        <RoleBasedElement required-role="lecturer">
          <button
            v-if="selectedDocuments.length > 0"
            class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            @click="addToQueue"
          >
            <FileSearch class="w-5 h-5 mr-2" />
            Thêm {{ selectedDocuments.length }} vào kiểm tra đạo văn
          </button>
        </RoleBasedElement>

        <button
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          @click="handleUpload"
        >
          <Upload class="w-5 h-5 mr-2" />
          Tải lên tài liệu
        </button>
      </div>
      <input type="file" ref="fileInput" accept=".pdf" class="hidden" @change="onFileSelected" />
    </div>

    <!-- Search -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Tìm kiếm tài liệu..."
          class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-xl font-bold mb-4">Xác nhận xoá</h3>
        <p class="mb-6">
          Bạn có chắc chắn muốn xoá {{ selectedDocuments.length }} tài liệu đã chọn? Hành động này
          không thể hoàn tác.
        </p>
        <div class="flex justify-end space-x-3">
          <button
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            @click="showDeleteModal = false"
          >
            Huỷ
          </button>
          <button
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            @click="deleteSelected"
          >
            Xoá
          </button>
        </div>
      </div>
    </div>

    <!-- Documents Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="doc in filteredDocuments"
        :key="doc._id"
        class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow relative"
      >
        <div class="absolute top-4 left-4 z-10">
          <label :for="`doc-${doc._id}`" class="checkbox-container">
            <input
              type="checkbox"
              :id="`doc-${doc._id}`"
              v-model="selectedDocuments"
              :value="doc"
              class="sr-only"
              @click.stop
            />
            <span class="custom-checkbox">
              <svg
                v-if="selectedDocuments.includes(doc)"
                xmlns="http://www.w3.org/2000/svg"
                class="h-3 w-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
          </label>
        </div>
        <router-link :to="`/documents/${doc._id}`" class="block p-6">
          <div class="flex items-start justify-between">
            <div class="flex-1 pl-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ doc.filename }}</h3>
              <p class="text-sm text-gray-600 mb-4">
                Uploaded by {{ doc.user }} on {{ formatDate(doc.upload_at) }}
              </p>

              <!-- Role badge for this document's owner - only visible to lecturers -->
              <RoleBasedElement required-role="lecturer">
                <div class="mb-2">
                  <span
                    class="px-2 py-1 bg-blue-100 text-xs font-medium text-blue-600 rounded-full"
                  >
                    {{ doc.role || 'student' }}
                  </span>
                </div>
              </RoleBasedElement>

              <!-- <div class="flex flex-wrap gap-2">
                <span
                  v-for="category in doc.categories"
                  :key="category"
                  class="px-2 py-1 bg-gray-100 text-xs font-medium text-gray-600 rounded-full"
                >
                  {{ category }}
                </span>
              </div> -->
            </div>
            <FileText class="w-6 h-6 text-gray-400 flex-shrink-0" />
          </div>
          <p class="mt-4 text-sm text-gray-600 line-clamp-3">
            {{ doc.content }}
          </p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Trash2, Upload, Search, FileSearch, FileText } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import RoleBasedElement from '../components/RoleBasedElement.vue'
import { useUserStore } from '../stores/user'
import { useNotification } from '../plugins/notification'
import { getAllDocuments, uploadDocument, deleteDocument } from '../api/documents'

const router = useRouter()
const userStore = useUserStore()
const notify = useNotification()

const documents = ref([])
const searchQuery = ref('')
const fileInput = ref(null)
const selectedDocuments = ref([])
const showDeleteModal = ref(false)
const loading = ref(false)

// Fetch documents from API
async function fetchDocuments() {
  loading.value = true
  try {
    const data = await getAllDocuments()
    documents.value = data
  } catch (error) {
    console.error('Error fetching documents:', error)
    notify.error('Failed to load documents. Please try again later.')
    documents.value = [] // Set to empty array to prevent rendering issues
  } finally {
    loading.value = false
  }
}

// Filter documents based on search query
const filteredDocuments = computed(() => {
  if (!searchQuery.value) return documents.value

  const query = searchQuery.value.toLowerCase()
  return documents.value.filter(
    (doc) =>
      doc.filename?.toLowerCase().includes(query) || doc.content?.toLowerCase().includes(query),
  )
})

// Handle file upload
function handleUpload() {
  fileInput.value.click()
}

// Process selected file
async function onFileSelected(event) {
  const file = event.target.files[0]
  if (!file) return

  loading.value = true
  try {
    await uploadDocument(file)
    await fetchDocuments()
    notify.success('Document uploaded successfully')
  } catch (error) {
    console.error('Error uploading document:', error)
    notify.error('Failed to upload document. Please try again.')
  } finally {
    loading.value = false
    // Reset file input
    fileInput.value.value = null
  }
}

// Confirm deletion
function confirmDelete() {
  showDeleteModal.value = true
}

// Delete selected documents
async function deleteSelected() {
  loading.value = true
  try {
    const documentIds = selectedDocuments.value.map((doc) => doc._id)

    // Use Promise.all to delete multiple documents
    await Promise.all(documentIds.map((id) => deleteDocument(id)))

    await fetchDocuments()
    selectedDocuments.value = []
    notify.success('Documents deleted successfully')
  } catch (error) {
    console.error('Error deleting documents:', error)
    notify.error('Failed to delete documents. Please try again.')
  } finally {
    loading.value = false
    showDeleteModal.value = false
  }
}

// Add selected documents to plagiarism check (lecturer only)
async function addToQueue() {
  if (!userStore.isLecturer) {
    notify.error('Only lecturers can access this feature')
    return
  }

  try {
    // Skip API call since it's giving 404 errors
    // Instead, work directly with localStorage

    // Store the selected documents in localStorage for plagiarism check page
    localStorage.setItem('plagiarismCheckQueue', JSON.stringify(selectedDocuments.value))

    // Show success notification
    notify.success(
      `${selectedDocuments.value.length} tài liệu đã được thêm vào hàng đợi kiểm tra đạo văn`,
    )

    // Navigate to plagiarism check page
    router.push('/plagiarism-check')
  } catch (error) {
    console.error('Error adding to plagiarism check:', error)
    notify.error('Đã xảy ra lỗi khi thêm tài liệu vào kiểm tra đạo văn. Vui lòng thử lại.')
  } finally {
    loading.value = false
  }
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

onMounted(() => {
  fetchDocuments()
})
</script>

<style>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Custom checkbox styling */
.checkbox-container {
  display: inline-block;
  position: relative;
  cursor: pointer;
}

.custom-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 22px;
  width: 22px;
  background-color: white;
  border: 2px solid #cbd5e0;
  border-radius: 4px;
  transition: all 0.2s ease;
}

input:checked + .custom-checkbox {
  background-color: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

input:focus + .custom-checkbox {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.custom-checkbox:hover {
  border-color: #3b82f6;
}
</style>
