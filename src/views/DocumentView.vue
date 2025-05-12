<template>
  <div class="flex-1 p-4 sm:p-8 overflow-auto">
    <div v-if="document" class="max-w-4xl mx-auto">
      <div class="mb-6 flex justify-between items-center">
        <router-link
          to="/documents"
          class="inline-flex items-center text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft class="w-4 h-4 mr-2" />
          Back to Documents
        </router-link>

        <button
          @click="confirmDelete"
          class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Trash2 class="w-4 h-4 mr-2" />
          Xoá tài liệu
        </button>
      </div>

      <div class="bg-white rounded-lg shadow-lg p-4 sm:p-8">
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ document.filename }}</h1>
          <div class="flex items-center text-gray-600 mb-4">
            <User class="w-4 h-4 mr-2" />
            <span>{{ document.user }}</span>
            <span class="mx-2">•</span>
            <Calendar class="w-4 h-4 mr-2" />
            <span>{{ formatDate(document.upload_at) }}</span>
          </div>
        </div>

        <div class="prose max-w-none">
          <p class="text-gray-700 leading-relaxed">{{ document.content }}</p>
        </div>
      </div>
    </div>

    <div v-else class="flex items-center justify-center h-64">
      <Loader2 class="w-8 h-8 animate-spin text-gray-400" />
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-xl font-bold mb-4">Xác nhận xoá</h3>
        <p class="mb-6">
          Bạn có chắc chắn muốn xoá tài liệu "{{ document?.filename }}"? Hành động này không thể
          hoàn tác.
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
            @click="deleteDocument"
          >
            Xoá
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, User, Calendar, Loader2, Trash2 } from 'lucide-vue-next'
import { getDocumentById, deleteDocument as apiDeleteDocument } from '../api/documents'

const route = useRoute()
const router = useRouter()
const document = ref(null)
const showDeleteModal = ref(false)
const isDeleting = ref(false)

const fetchDocument = async () => {
  try {
    document.value = await getDocumentById(route.params.id)
  } catch (error) {
    console.error('Error fetching document:', error)
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Show delete confirmation dialog
const confirmDelete = () => {
  showDeleteModal.value = true
}

// Delete the current document
const deleteDocument = async () => {
  if (isDeleting.value || !document.value) return

  isDeleting.value = true
  try {
    await apiDeleteDocument(document.value._id)
    showDeleteModal.value = false

    // Navigate back to documents list
    router.push('/documents')
  } catch (error) {
    console.error('Error deleting document:', error)
  } finally {
    isDeleting.value = false
  }
}

onMounted(() => {
  fetchDocument()
})
</script>

<style scoped>
.prose {
  max-width: 100%;
  width: 100%;
}

.prose p {
  text-align: justify;
  line-height: 1.8;
  margin-bottom: 1.5rem;
  hyphens: auto;
  overflow-wrap: break-word;
  word-wrap: break-word;
}

@media (max-width: 640px) {
  .prose p {
    text-align: left;
  }
}
</style>
