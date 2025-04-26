<template>
  <div class="flex-1 p-3 md:p-4 max-w-7xl mx-auto" @click="handleGlobalClick">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <svg
        class="animate-spin h-8 w-8 text-gray-400"
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
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
      <div class="flex items-center">
        <svg
          class="h-6 w-6 text-red-500 mr-3"
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
        <h3 class="text-lg font-medium text-red-800">Lỗi khi tải dữ liệu</h3>
      </div>
      <div class="mt-2 text-sm text-red-700">{{ error }}</div>
      <div class="mt-4">
        <button
          @click="goBackToResults"
          class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Quay lại trang kết quả
        </button>
      </div>
    </div>

    <div v-else-if="pairDetails" class="space-y-4">
      <!-- Navigation and Summary Header -->
      <div class="flex items-center justify-between">
        <router-link
          to="/view-results"
          class="inline-flex items-center text-blue-600 hover:text-blue-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Results
        </router-link>
      </div>

      <!-- Summary Card -->
      <div class="bg-white rounded-lg shadow-sm p-4">
        <h1 class="text-xl font-bold text-gray-900 mb-3">Chi tiết kết quả kiểm tra đạo văn</h1>

        <div class="flex flex-wrap items-center gap-4 mb-4">
          <div class="flex items-center">
            <span class="text-sm font-medium text-gray-500 mr-2">Tài liệu 1:</span>
            <span class="text-sm font-bold text-gray-900">{{ pairDetails.doc1_filename }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-sm font-medium text-gray-500 mr-2">Tài liệu 2:</span>
            <span class="text-sm font-bold text-gray-900">{{ pairDetails.doc2_filename }}</span>
          </div>
        </div>

        <!-- Similarity scores in a nice horizontal layout -->
        <div class="flex flex-wrap gap-4 items-center mb-2">
          <div class="flex-1">
            <span class="text-sm font-medium text-gray-500 mr-2">Tỉ lệ tương đồng tổng thể:</span>
            <span
              class="text-sm font-bold"
              :class="getSimilarityTextColor(pairDetails.bert_similarity_percentage)"
            >
              {{ pairDetails.bert_similarity_percentage }}%
            </span>
          </div>

          <div class="flex gap-3">
            <!-- LSA Score -->
            <div class="flex flex-col">
              <span class="text-xs font-medium text-blue-600 mb-1">LSA</span>
              <div class="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                <div
                  class="h-full bg-blue-500 rounded-full"
                  :style="{ width: `${pairDetails.lsa_similarity_percentage}%` }"
                ></div>
              </div>
              <span class="text-xs font-medium mt-1"
                >{{ pairDetails.lsa_similarity_percentage }}%</span
              >
            </div>

            <!-- BERT Score -->
            <div class="flex flex-col">
              <span class="text-xs font-medium text-purple-600 mb-1">BERT</span>
              <div class="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                <div
                  class="h-full bg-purple-500 rounded-full"
                  :style="{ width: `${pairDetails.bert_similarity_percentage}%` }"
                ></div>
              </div>
              <span class="text-xs font-medium mt-1"
                >{{ pairDetails.bert_similarity_percentage }}%</span
              >
            </div>
          </div>

          <div>
            <span
              class="px-3 py-1 text-sm font-medium rounded-full"
              :class="
                pairDetails.final_result ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              "
            >
              {{ pairDetails.final_result ? 'Trùng lặp' : 'Không trùng lặp' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Active selection info -->
      <div v-if="selectedSection" class="fixed bottom-4 right-4 z-50 similarity-badge shadow-xl">
        <div class="flex items-center">
          <div class="font-bold text-white">Tỉ lệ tương đồng: {{ selectedSectionSimilarity }}%</div>
          <button
            @click.stop="clearSelection"
            class="ml-2 text-white hover:text-yellow-200 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Documents Comparison -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Document 1 -->
        <div class="bg-white rounded-lg shadow-sm p-4 relative">
          <h2 class="text-lg font-bold text-gray-900 mb-3 truncate">
            {{ pairDetails.doc1_filename }}
          </h2>
          <div class="prose max-w-none mt-4 text-sm" ref="doc1Content">
            <p class="text-gray-700 leading-relaxed whitespace-pre-line">
              <template v-for="(chunk, index) in doc1Chunks" :key="index">
                <span
                  v-if="chunk.isHighlighted"
                  class="highlighted-text cursor-pointer"
                  :class="{
                    'active-highlight':
                      hoveredSection === chunk.sectionId || selectedSection === chunk.sectionId,
                    'bert-highlight': chunk.type === 'bert',
                  }"
                  @mouseover="highlightPair(chunk.sectionId)"
                  @mouseleave="clearHighlight()"
                  @click.stop="selectSection(chunk)"
                  :data-section-id="chunk.sectionId"
                >
                  {{ chunk.text }}
                </span>
                <span v-else>{{ chunk.text }}</span>
              </template>
            </p>
          </div>
        </div>

        <!-- Document 2 -->
        <div class="bg-white rounded-lg shadow-sm p-4 relative">
          <h2 class="text-lg font-bold text-gray-900 mb-3 truncate">
            {{ pairDetails.doc2_filename }}
          </h2>
          <div class="prose max-w-none mt-4 text-sm" ref="doc2Content">
            <p class="text-gray-700 leading-relaxed whitespace-pre-line">
              <template v-for="(chunk, index) in doc2Chunks" :key="index">
                <span
                  v-if="chunk.isHighlighted"
                  class="highlighted-text cursor-pointer"
                  :class="{
                    'active-highlight':
                      hoveredSection === chunk.sectionId || selectedSection === chunk.sectionId,
                    'bert-highlight': chunk.type === 'bert',
                  }"
                  @mouseover="highlightPair(chunk.sectionId)"
                  @mouseleave="clearHighlight()"
                  @click.stop="selectSection(chunk)"
                  :data-section-id="chunk.sectionId"
                >
                  {{ chunk.text }}
                </span>
                <span v-else>{{ chunk.text }}</span>
              </template>
            </p>
          </div>
        </div>
      </div>

      <!-- Similarity Details Section -->
      <div class="bg-white rounded-lg shadow-sm p-4">
        <h2 class="text-lg font-bold text-gray-900 mb-3">Chi tiết đoạn văn tương đồng</h2>

        <div class="mb-4">
          <div class="flex gap-2 items-center">
            <span class="inline-block h-3 w-3 bg-green-200 border border-green-400 rounded"></span>
            <span class="text-sm">BERT Match</span>
          </div>
        </div>

        <!-- List of matched sections -->
        <div v-if="bertPlagiarizedSections.length > 0" class="space-y-4 mt-6">
          <div
            v-for="(section, index) in bertPlagiarizedSections"
            :key="index"
            class="border rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer"
            :class="{
              'border-green-300 bg-green-50': section.detection_layer === 'bert',
              'ring-2 ring-purple-500': selectedSection === 'section-' + index,
            }"
            @mouseover="highlightPair('section-' + index)"
            @mouseleave="clearHighlight()"
            @click.stop="selectSectionFromList(section, index)"
          >
            <div class="flex justify-between mb-2">
              <div class="text-sm font-medium">BERT Match</div>
              <div class="text-sm font-bold">
                {{ section.similarity_percentage }}%
                <span class="text-xs font-normal text-gray-500">tương đồng</span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div class="p-2 bg-gray-50 rounded text-sm">
                <div class="text-xs font-medium text-gray-500 mb-1">
                  {{ pairDetails.doc1_filename }}
                </div>
                <div>{{ section.doc1_content }}</div>
              </div>
              <div class="p-2 bg-gray-50 rounded text-sm">
                <div class="text-xs font-medium text-gray-500 mb-1">
                  {{ pairDetails.doc2_filename }}
                </div>
                <div>{{ section.doc2_content }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- No matches found -->
        <div v-else class="text-center py-4 text-gray-500">Không tìm thấy đoạn văn tương đồng</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { comparePdfsByName } from '../api/plagiarism'

// Use route parameters to get file names
const route = useRoute()
const router = useRouter()
const pairDetails = ref(null)
const hoveredSection = ref(null)
const selectedSection = ref(null)
const selectedSectionSimilarity = ref(null)
const loading = ref(true)
const error = ref(null)

// Fetch data using the API
const fetchPairDetails = async () => {
  try {
    loading.value = true
    error.value = null

    // Get file names from route parameters
    const file1 = route.params.file1
    const file2 = route.params.file2

    if (!file1 || !file2) {
      throw new Error('Missing file names in URL parameters')
    }

    // Remove .pdf extension if present (API expects name without extension)
    const file1Name = file1.endsWith('.pdf') ? file1.slice(0, -4) : file1
    const file2Name = file2.endsWith('.pdf') ? file2.slice(0, -4) : file2

    // Call the API to get comparison results
    const response = await comparePdfsByName(file1Name, file2Name)

    // The API returns the whole result object, but we need the first pair in all_document_pairs
    if (response.all_document_pairs && response.all_document_pairs.length > 0) {
      pairDetails.value = response.all_document_pairs[0]
    } else {
      throw new Error('No comparison results found')
    }
  } catch (err) {
    console.error('Error fetching pair details:', err)
    error.value = err.message || 'Failed to load comparison results'
  } finally {
    loading.value = false
  }
}

// Filter to get only BERT plagiarized sections
const bertPlagiarizedSections = computed(() => {
  if (!pairDetails.value) return []
  return pairDetails.value.all_plagiarized_sections.filter(
    (section) => section.detection_layer === 'bert',
  )
})

// Process document content for highlighting
const processDocumentContent = (content, sections, isDoc1) => {
  if (!content) return []

  const chunks = []
  let lastIndex = 0

  // Create a sorted array of all sections
  const allSections = []

  // Process BERT matches only
  if (pairDetails.value.bert_sections) {
    pairDetails.value.bert_sections.forEach((section, index) => {
      const text = isDoc1 ? section.doc1_content : section.doc2_content
      allSections.push({
        text,
        start: content.toLowerCase().indexOf(text.toLowerCase()),
        length: text.length,
        type: 'bert',
        sectionId: `bert-${index}`,
        similarity: section.similarity_percentage,
      })
    })
  }

  // Process all plagiarized sections (only BERT)
  if (pairDetails.value.all_plagiarized_sections) {
    pairDetails.value.all_plagiarized_sections
      .filter((section) => section.detection_layer === 'bert')
      .forEach((section, index) => {
        const text = isDoc1 ? section.doc1_content : section.doc2_content
        allSections.push({
          text,
          start: content.toLowerCase().indexOf(text.toLowerCase()),
          length: text.length,
          type: 'bert',
          sectionId: `section-${index}`,
          similarity: section.similarity_percentage,
        })
      })
  }

  // Sort sections by start position
  allSections.sort((a, b) => a.start - b.start)

  // Remove overlapping sections (keeping the longer ones)
  const filteredSections = []
  for (let i = 0; i < allSections.length; i++) {
    if (allSections[i].start === -1) continue // Skip if not found

    let overlapping = false
    for (let j = 0; j < filteredSections.length; j++) {
      const a = filteredSections[j]
      const b = allSections[i]

      // Check for overlap
      if (!(a.start + a.length <= b.start || b.start + b.length <= a.start)) {
        // If this section overlaps with an existing one
        overlapping = true

        // If current section is longer, replace the existing one
        if (b.length > a.length) {
          filteredSections[j] = b
        }
        break
      }
    }

    if (!overlapping) {
      filteredSections.push(allSections[i])
    }
  }

  // Sort filtered sections again by start position
  filteredSections.sort((a, b) => a.start - b.start)

  // Create chunks with highlights
  filteredSections.forEach((section) => {
    if (section.start > lastIndex) {
      // Add non-highlighted chunk
      chunks.push({
        text: content.substring(lastIndex, section.start),
        isHighlighted: false,
      })
    }

    // Add highlighted chunk
    chunks.push({
      text: content.substring(section.start, section.start + section.length),
      isHighlighted: true,
      type: section.type,
      sectionId: section.sectionId,
      similarity: section.similarity,
    })

    lastIndex = section.start + section.length
  })

  // Add remaining text
  if (lastIndex < content.length) {
    chunks.push({
      text: content.substring(lastIndex),
      isHighlighted: false,
    })
  }

  return chunks
}

// Computed properties for document chunks
const doc1Chunks = computed(() => {
  if (!pairDetails.value) return []
  return processDocumentContent(
    pairDetails.value.doc1_content,
    pairDetails.value.bert_sections || [],
    true,
  )
})

const doc2Chunks = computed(() => {
  if (!pairDetails.value) return []
  return processDocumentContent(
    pairDetails.value.doc2_content,
    pairDetails.value.bert_sections || [],
    false,
  )
})

// Methods for highlight interactions
const highlightPair = (sectionId) => {
  if (!selectedSection.value) {
    hoveredSection.value = sectionId
  }
}

const clearHighlight = () => {
  if (!selectedSection.value) {
    hoveredSection.value = null
  }
}

// Methods for section selection
const selectSection = (chunk) => {
  selectedSection.value = chunk.sectionId
  selectedSectionSimilarity.value = chunk.similarity
  hoveredSection.value = null
}

const selectSectionFromList = (section, index) => {
  selectedSection.value = 'section-' + index
  selectedSectionSimilarity.value = section.similarity_percentage
  hoveredSection.value = null
}

const clearSelection = (event) => {
  if (event) event.stopPropagation()
  selectedSection.value = null
  selectedSectionSimilarity.value = null
}

// Global click handler to clear selection when clicking outside highlighted areas
const handleGlobalClick = (event) => {
  // Check if the click was on a highlighted section
  const isHighlightedSection = event.target.closest('.highlighted-text')
  const isMatchList = event.target.closest('.space-y-4.mt-6')
  const isSimilarityBadge = event.target.closest('.similarity-badge')

  if (!isHighlightedSection && !isMatchList && !isSimilarityBadge) {
    clearSelection()
  }
}

// Helper function to get text color based on similarity percentage
const getSimilarityTextColor = (percentage) => {
  if (percentage >= 75) return 'text-red-600'
  if (percentage >= 50) return 'text-orange-600'
  return 'text-green-600'
}

// Navigate back to results
const goBackToResults = () => {
  router.push('/view-results')
}

onMounted(() => {
  fetchPairDetails()
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
  hyphens: auto;
  overflow-wrap: break-word;
  word-wrap: break-word;
}

.highlighted-text {
  transition: all 0.2s ease;
}

.bert-highlight {
  background-color: rgba(167, 243, 208, 0.5);
  border-bottom: 1px dashed #10b981;
}

.active-highlight {
  background-color: rgba(253, 224, 71, 0.8);
  border-bottom: 1px solid #d97706;
  font-weight: 500;
}

.similarity-badge {
  background-color: #f59e0b;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  transition: all 0.3s ease;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dim other content when a section is highlighted */
.prose p:has(.active-highlight) span:not(.active-highlight) {
  opacity: 0.4;
  transition: opacity 0.3s ease;
}

@media (max-width: 640px) {
  .prose p {
    text-align: left;
  }
}
</style>
