<template>
  <div class="flex-1 p-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Tài liệu</h1>
      <button
        class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        @click="handleUpload"
      >
        <Upload class="w-5 h-5 mr-2" />
        Tải lên tài liệu
      </button>
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

    <!-- Documents Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="doc in filteredDocuments"
        :key="doc._id"
        class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
      >
        <router-link :to="`/documents/${doc._id}`" class="block p-6">
          <div class="flex items-start justify-between">
            <div class="flex-1">
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
import { Search, Upload, FileText } from 'lucide-vue-next'
import { getAllDocuments, uploadDocument } from '../api/documents'

const documents = ref([])
const searchQuery = ref('')
// const selectedCategory = ref(null);
const fileInput = ref(null)

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
</style>
