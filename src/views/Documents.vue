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
        <button
          v-if="selectedDocuments.length > 0"
          class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          @click="addToQueue"
        >
          <FileSearch class="w-5 h-5 mr-2" />
          Thêm {{ selectedDocuments.length }} vào kiểm tra đạo văn
        </button>
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

    <!-- Categories -->
    <!-- <div class="mb-6">
      <div class="flex flex-wrap gap-2">
        <button
          @click="selectedCategory = null"
          class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
          :class="!selectedCategory ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        >
          Tất cả
        </button>
        <button
          v-for="category in uniqueCategories"
          :key="category"
          @click="selectedCategory = category"
          class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
          :class="selectedCategory === category ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        >
          {{ category }}
        </button>
      </div>
    </div> -->

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
import { Search, Upload, FileText, FileSearch, Trash2 } from 'lucide-vue-next'
import { getAllDocuments, uploadDocument, deleteMultipleDocuments } from '../api/documents'
import { useRouter } from 'vue-router'

const documents = ref([])
const searchQuery = ref('')
// const selectedCategory = ref(null);
const fileInput = ref(null)
const selectedDocuments = ref([])
const showDeleteModal = ref(false)
const isDeleting = ref(false)
const router = useRouter()

// Fetch documents
const fetchDocuments = async () => {
  try {
    documents.value = await getAllDocuments()
  } catch (error) {
    console.error('Error fetching documents:', error)
  }
}

// Handle file upload button click
const handleUpload = () => {
  fileInput.value.click()
}

// Handle file selection
const onFileSelected = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    await uploadDocument(file)
    await fetchDocuments() // Refresh the documents list
  } catch (error) {
    console.error('Error uploading file:', error)
  }
}

// Confirm delete selected documents
const confirmDelete = () => {
  if (selectedDocuments.value.length > 0) {
    showDeleteModal.value = true
  }
}

// Delete selected documents
const deleteSelected = async () => {
  if (isDeleting.value) return // Prevent multiple clicks

  isDeleting.value = true
  try {
    const documentIds = selectedDocuments.value.map((doc) => doc._id)
    await deleteMultipleDocuments(documentIds)

    // Clear selection and close modal
    selectedDocuments.value = []
    showDeleteModal.value = false

    // Refresh documents list
    await fetchDocuments()
  } catch (error) {
    console.error('Error deleting documents:', error)
  } finally {
    isDeleting.value = false
  }
}

// Get unique categories
// const uniqueCategories = computed(() => {
//   const categories = new Set();
//   documents.value.forEach(doc => {
//     doc.categories.forEach(category => categories.add(category));
//   });
//   return Array.from(categories);
// });

// Filter documents based on search and category
const filteredDocuments = computed(() => {
  return documents.value.filter((doc) => {
    const matchesSearch =
      searchQuery.value === '' ||
      doc.filename.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.value.toLowerCase())

    // const matchesCategory = !selectedCategory.value ||
    //   doc.categories.includes(selectedCategory.value);

    return matchesSearch // && matchesCategory;
  })
})

// Format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Add selected documents to plagiarism check queue
const addToQueue = () => {
  // Store selected documents in localStorage
  localStorage.setItem('plagiarismCheckQueue', JSON.stringify(selectedDocuments.value))

  // Navigate to plagiarism check page
  router.push('/plagiarism-check')

  // Clear selection after adding to queue
  selectedDocuments.value = []
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
