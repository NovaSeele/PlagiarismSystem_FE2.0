<template>
  <div class="flex-1 p-4 sm:p-8 overflow-auto">
    <div v-if="document" class="max-w-4xl mx-auto">
      <div class="mb-6">
        <router-link
          to="/documents"
          class="inline-flex items-center text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft class="w-4 h-4 mr-2" />
          Back to Documents
        </router-link>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, User, Calendar, Loader2 } from 'lucide-vue-next'
import { getDocumentById } from '../api/documents'

const route = useRoute()
const document = ref(null)

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