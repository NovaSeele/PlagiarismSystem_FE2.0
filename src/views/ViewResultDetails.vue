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
        <div class="mb-4">
          <!-- Overall similarity with progress bar -->
          <div class="flex flex-col">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium text-gray-500">Tỉ lệ tương đồng tổng thể:</span>
              <span
                class="text-sm font-bold"
                :class="getSimilarityTextColor(pairDetails.bert_similarity_percentage)"
              >
                {{ pairDetails.bert_similarity_percentage }}%
              </span>
            </div>
            <div class="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full"
                :class="getSimilarityBarColor(pairDetails.bert_similarity_percentage)"
                :style="{ width: `${pairDetails.bert_similarity_percentage}%` }"
              ></div>
            </div>
          </div>
        </div>

        <div class="flex justify-end">
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
      <div v-if="selectedSection" class="fixed bottom-4 right-4 z-50 shadow-xl">
        <div class="similarity-badge">
          <div class="flex items-center">
            <div class="font-bold text-white">
              Tỉ lệ tương đồng:
              {{
                Array.isArray(selectedSectionSimilarity)
                  ? Number(selectedSectionSimilarity[0]).toFixed(1)
                  : Number(selectedSectionSimilarity).toFixed(1)
              }}%
            </div>
          </div>
          <button
            @click.stop="clearSelection"
            class="absolute top-2 right-2 text-white hover:text-yellow-200 focus:outline-none"
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
                      isActiveSection(chunk.sectionId, hoveredSection) ||
                      isActiveSection(chunk.sectionId, selectedSection),
                    'bert-highlight': chunk.type === 'bert',
                  }"
                  @mouseover="highlightPair(chunk.sectionId)"
                  @mouseleave="clearHighlight()"
                  @click.stop="selectSection(chunk)"
                  :data-section-id="chunk.sectionId"
                  :data-related-ids="chunk.relatedIds ? chunk.relatedIds.join(',') : ''"
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
                      isActiveSection(chunk.sectionId, hoveredSection) ||
                      isActiveSection(chunk.sectionId, selectedSection),
                    'bert-highlight': chunk.type === 'bert',
                  }"
                  @mouseover="highlightPair(chunk.sectionId)"
                  @mouseleave="clearHighlight()"
                  @click.stop="selectSection(chunk)"
                  :data-section-id="chunk.sectionId"
                  :data-related-ids="chunk.relatedIds ? chunk.relatedIds.join(',') : ''"
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
              'ring-2 ring-purple-500': isActiveSection('section-' + index, selectedSection),
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
        relatedIds: [`bert-${index}`], // Initialize with its own ID
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
          relatedIds: [`section-${index}`], // Initialize with its own ID
        })
      })
  }

  // Sort sections by start position
  allSections.sort((a, b) => a.start - b.start)

  // Handle overlapping sections by merging them
  const mergedSections = []

  for (let i = 0; i < allSections.length; i++) {
    const currentSection = allSections[i]
    if (currentSection.start === -1) continue // Skip if not found

    // Check if this section overlaps with any existing merged section
    let merged = false

    for (let j = 0; j < mergedSections.length; j++) {
      const existingSection = mergedSections[j]

      // Check for overlap
      const overlaps = !(
        currentSection.start >= existingSection.start + existingSection.length ||
        existingSection.start >= currentSection.start + currentSection.length
      )

      if (overlaps) {
        // Merge the sections
        merged = true

        // Calculate the new boundaries
        const newStart = Math.min(existingSection.start, currentSection.start)
        const newEnd = Math.max(
          existingSection.start + existingSection.length,
          currentSection.start + currentSection.length,
        )

        // Update the existing section
        existingSection.start = newStart
        existingSection.length = newEnd - newStart
        existingSection.text = content.substring(newStart, newEnd)

        // Combine the section IDs and keep track of all related sections
        existingSection.relatedIds = [
          ...new Set([...existingSection.relatedIds, ...currentSection.relatedIds]),
        ]

        // Take the highest similarity value
        existingSection.similarity = Math.max(existingSection.similarity, currentSection.similarity)

        break
      }
    }

    if (!merged) {
      // If no overlap, add as a new section
      mergedSections.push({ ...currentSection })
    }
  }

  // Sort merged sections by start position
  mergedSections.sort((a, b) => a.start - b.start)

  // Create chunks with highlights
  mergedSections.forEach((section) => {
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
      sectionId: section.relatedIds[0], // Use the first ID for main identification
      relatedIds: section.relatedIds, // Keep all related IDs
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
    // Start with the current section ID
    hoveredSection.value = sectionId

    // First, collect all directly related sections
    const allRelatedIds = new Set([sectionId])

    // Find all sections in document 1 that are related to the hovered section
    doc1Chunks.value.forEach((chunk) => {
      if (chunk.isHighlighted && chunk.relatedIds) {
        // If this chunk contains the section ID we're highlighting
        if (chunk.relatedIds.includes(sectionId)) {
          // Add all related IDs from this chunk
          chunk.relatedIds.forEach((id) => allRelatedIds.add(id))
        }
      }
    })

    // Find all sections in document 2 that are related to the hovered section
    doc2Chunks.value.forEach((chunk) => {
      if (chunk.isHighlighted && chunk.relatedIds) {
        // If this chunk contains the section ID we're highlighting
        if (chunk.relatedIds.includes(sectionId)) {
          // Add all related IDs from this chunk
          chunk.relatedIds.forEach((id) => allRelatedIds.add(id))
        }
      }
    })

    // Find any sections that might be indirectly related (through other sections)
    let prevSize = 0
    while (prevSize !== allRelatedIds.size) {
      prevSize = allRelatedIds.size

      // Check document 1 for new related sections
      doc1Chunks.value.forEach((chunk) => {
        if (chunk.isHighlighted && chunk.relatedIds) {
          // If any of this chunk's related IDs are in our set
          const hasRelatedId = chunk.relatedIds.some((id) => allRelatedIds.has(id))
          if (hasRelatedId) {
            // Add all of its related IDs
            chunk.relatedIds.forEach((id) => allRelatedIds.add(id))
          }
        }
      })

      // Check document 2 for new related sections
      doc2Chunks.value.forEach((chunk) => {
        if (chunk.isHighlighted && chunk.relatedIds) {
          // If any of this chunk's related IDs are in our set
          const hasRelatedId = chunk.relatedIds.some((id) => allRelatedIds.has(id))
          if (hasRelatedId) {
            // Add all of its related IDs
            chunk.relatedIds.forEach((id) => allRelatedIds.add(id))
          }
        }
      })
    }

    // Convert the set to a pipe-separated string (removing the original sectionId as it's already included)
    hoveredSection.value = Array.from(allRelatedIds).join('|')
  }
}

const clearHighlight = () => {
  if (!selectedSection.value) {
    hoveredSection.value = null
  }
}

// Helper function to find all related section IDs
const findAllRelatedSectionIds = (initialSectionId) => {
  // Start with the current section ID
  const allRelatedIds = new Set([initialSectionId])

  // Find all sections that are directly or indirectly related
  let prevSize = 0
  while (prevSize !== allRelatedIds.size) {
    prevSize = allRelatedIds.size

    // Check document 1 for related sections
    doc1Chunks.value.forEach((chunk) => {
      if (chunk.isHighlighted && chunk.relatedIds) {
        // If any of this chunk's related IDs are in our set
        const hasRelatedId = chunk.relatedIds.some((id) => allRelatedIds.has(id))
        if (hasRelatedId) {
          // Add all of its related IDs
          chunk.relatedIds.forEach((id) => allRelatedIds.add(id))
        }
      }
    })

    // Check document 2 for related sections
    doc2Chunks.value.forEach((chunk) => {
      if (chunk.isHighlighted && chunk.relatedIds) {
        // If any of this chunk's related IDs are in our set
        const hasRelatedId = chunk.relatedIds.some((id) => allRelatedIds.has(id))
        if (hasRelatedId) {
          // Add all of its related IDs
          chunk.relatedIds.forEach((id) => allRelatedIds.add(id))
        }
      }
    })
  }

  return Array.from(allRelatedIds)
}

// Helper function to collect all similarity values for the given section IDs
const collectSimilarityValues = (sectionIds) => {
  // Use a Set to store unique similarity values
  const uniqueSimilarities = new Set()

  // First look for similarity values in the all_plagiarized_sections
  if (pairDetails.value && pairDetails.value.all_plagiarized_sections) {
    // For each section ID that starts with "section-", get the corresponding section
    sectionIds
      .filter((id) => id.startsWith('section-'))
      .forEach((id) => {
        const indexStr = id.split('-')[1]
        const index = parseInt(indexStr)

        if (
          !isNaN(index) &&
          pairDetails.value.all_plagiarized_sections[index] &&
          pairDetails.value.all_plagiarized_sections[index].similarity_percentage
        ) {
          // Round to 1 decimal place for consistency
          const value =
            Math.round(
              pairDetails.value.all_plagiarized_sections[index].similarity_percentage * 10,
            ) / 10
          if (!isNaN(value)) {
            uniqueSimilarities.add(value)
          }
        }
      })
  }

  // If we don't have any values yet, try looking in bert_sections
  if (uniqueSimilarities.size === 0 && pairDetails.value && pairDetails.value.bert_sections) {
    // For each section ID that starts with "bert-", get the corresponding bert section
    sectionIds
      .filter((id) => id.startsWith('bert-'))
      .forEach((id) => {
        const indexStr = id.split('-')[1]
        const index = parseInt(indexStr)

        if (
          !isNaN(index) &&
          pairDetails.value.bert_sections[index] &&
          pairDetails.value.bert_sections[index].similarity_percentage
        ) {
          // Round to 1 decimal place for consistency
          const value =
            Math.round(pairDetails.value.bert_sections[index].similarity_percentage * 10) / 10
          if (!isNaN(value)) {
            uniqueSimilarities.add(value)
          }
        }
      })
  }

  // If we still don't have values, as a last resort look in the chunks
  if (uniqueSimilarities.size === 0) {
    // First check in document 1
    for (const sectionId of sectionIds) {
      const chunk = doc1Chunks.value.find((c) => c.isHighlighted && c.sectionId === sectionId)

      if (chunk && typeof chunk.similarity === 'number') {
        // Round to 1 decimal place for consistency
        const value = Math.round(chunk.similarity * 10) / 10
        if (!isNaN(value)) {
          uniqueSimilarities.add(value)
          break // Only need one value from chunks
        }
      }
    }

    // If no values from doc1, check doc2
    if (uniqueSimilarities.size === 0) {
      for (const sectionId of sectionIds) {
        const chunk = doc2Chunks.value.find((c) => c.isHighlighted && c.sectionId === sectionId)

        if (chunk && typeof chunk.similarity === 'number') {
          // Round to 1 decimal place for consistency
          const value = Math.round(chunk.similarity * 10) / 10
          if (!isNaN(value)) {
            uniqueSimilarities.add(value)
            break // Only need one value from chunks
          }
        }
      }
    }
  }

  // Convert Set to array and sort in descending order
  return Array.from(uniqueSimilarities).sort((a, b) => b - a)
}

// Methods for section selection
const selectSection = (chunk) => {
  // For the section highlighting, we need to find ALL related sections to ensure proper highlighting
  const allRelatedIds = findAllRelatedSectionIds(chunk.sectionId)

  // Update the selected section with ALL related IDs to ensure proper highlighting
  selectedSection.value = allRelatedIds.join('|')

  // For the similarity display, just use the direct similarity from the clicked section
  if (typeof chunk.similarity === 'number') {
    selectedSectionSimilarity.value = Math.round(chunk.similarity * 10) / 10
  } else {
    // If we don't have a direct similarity value, check if it's a BERT or section ID
    let sectionSimilarity

    if (chunk.sectionId.startsWith('section-')) {
      const index = parseInt(chunk.sectionId.split('-')[1])
      if (
        !isNaN(index) &&
        pairDetails.value &&
        pairDetails.value.all_plagiarized_sections &&
        pairDetails.value.all_plagiarized_sections[index]
      ) {
        sectionSimilarity = pairDetails.value.all_plagiarized_sections[index].similarity_percentage
      }
    } else if (chunk.sectionId.startsWith('bert-')) {
      const index = parseInt(chunk.sectionId.split('-')[1])
      if (
        !isNaN(index) &&
        pairDetails.value &&
        pairDetails.value.bert_sections &&
        pairDetails.value.bert_sections[index]
      ) {
        sectionSimilarity = pairDetails.value.bert_sections[index].similarity_percentage
      }
    }

    // If we found a direct similarity, use it
    if (sectionSimilarity !== undefined) {
      selectedSectionSimilarity.value = Math.round(sectionSimilarity * 10) / 10
    } else {
      // Otherwise, collect similarity values but only for the clicked section
      const directSectionId = chunk.sectionId
      const directSimilarityValues = collectSimilarityValues([directSectionId])

      if (directSimilarityValues.length > 0) {
        selectedSectionSimilarity.value = directSimilarityValues[0]
      } else {
        // Last resort: use the chunk's similarity or 0
        selectedSectionSimilarity.value = chunk.similarity || 0
      }
    }
  }

  hoveredSection.value = null
}

const selectSectionFromList = (section, index) => {
  const sectionId = 'section-' + index

  // For section highlighting, use findAllRelatedSectionIds to ensure all related sections are highlighted
  const allRelatedIds = findAllRelatedSectionIds(sectionId)

  // Update selected section with ALL related IDs to ensure proper highlighting
  selectedSection.value = allRelatedIds.join('|')

  // For the similarity display, just use the similarity directly from the section that was clicked
  const sectionSimilarity = section.similarity_percentage

  // Use the exact similarity from the clicked section
  if (typeof sectionSimilarity === 'number') {
    selectedSectionSimilarity.value = Math.round(sectionSimilarity * 10) / 10
  } else {
    // Fall back to collecting value only for this specific section
    const directSimilarityValues = collectSimilarityValues([sectionId])

    if (directSimilarityValues.length > 0) {
      selectedSectionSimilarity.value = directSimilarityValues[0]
    } else {
      // Last resort: default value
      selectedSectionSimilarity.value = 0
    }
  }

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

// Helper function to get bar color based on similarity percentage
const getSimilarityBarColor = (percentage) => {
  if (percentage >= 75) return 'bg-red-500'
  if (percentage >= 50) return 'bg-orange-500'
  return 'bg-green-500'
}

// Navigate back to results
const goBackToResults = () => {
  router.push('/view-results')
}

// Helper function to check if a section ID is active in the active IDs string
const isActiveSection = (sectionId, activeIds) => {
  if (!activeIds || !sectionId) return false

  // Get all the related IDs for this section
  const getSectionRelatedIds = (id) => {
    // First check in document 1
    const doc1Section = doc1Chunks.value.find(
      (chunk) =>
        chunk.isHighlighted &&
        (chunk.sectionId === id || (chunk.relatedIds && chunk.relatedIds.includes(id))),
    )
    if (doc1Section && doc1Section.relatedIds) {
      return doc1Section.relatedIds
    }

    // Then check in document 2
    const doc2Section = doc2Chunks.value.find(
      (chunk) =>
        chunk.isHighlighted &&
        (chunk.sectionId === id || (chunk.relatedIds && chunk.relatedIds.includes(id))),
    )
    if (doc2Section && doc2Section.relatedIds) {
      return doc2Section.relatedIds
    }

    return [id]
  }

  // If activeIds contains multiple IDs separated by |
  if (activeIds.includes('|')) {
    const idsArray = activeIds.split('|')

    // Check if the section ID is directly in the active IDs
    if (idsArray.includes(sectionId)) {
      return true
    }

    // Check if any of the active IDs are related to this section
    for (const activeId of idsArray) {
      const relatedIds = getSectionRelatedIds(activeId)
      if (relatedIds.includes(sectionId)) {
        return true
      }
    }

    // Check if any of this section's related IDs are in the active IDs
    const thisRelatedIds = getSectionRelatedIds(sectionId)
    for (const relatedId of thisRelatedIds) {
      if (idsArray.includes(relatedId)) {
        return true
      }
    }

    return false
  }

  // For single activeId (not containing |)
  if (activeIds === sectionId) {
    return true
  }

  // Check if the active ID is related to this section
  const activeRelatedIds = getSectionRelatedIds(activeIds)
  if (activeRelatedIds.includes(sectionId)) {
    return true
  }

  // Check if this section is related to the active ID
  const thisRelatedIds = getSectionRelatedIds(sectionId)
  return thisRelatedIds.includes(activeIds)
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
  position: relative;
  z-index: 1;
}

.bert-highlight {
  background-color: rgba(167, 243, 208, 0.5);
  border-bottom: 1px dashed #10b981;
}

.active-highlight {
  background-color: rgba(253, 224, 71, 0.8);
  border-bottom: 1px solid #d97706;
  font-weight: 500;
  z-index: 2;
  position: relative;
}

.similarity-badge {
  background-color: #f59e0b;
  color: white;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
  display: inline-flex;
  align-items: flex-start;
  transition: all 0.3s ease;
  animation: fadeIn 0.3s ease;
  z-index: 100;
  min-width: 150px;
  flex-direction: column;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.similarity-badge button {
  position: absolute;
  top: 10px;
  right: 10px;
}

.similarity-badge .flex-col {
  width: 100%;
}

.similarity-badge .flex-items-center {
  margin-bottom: 4px;
}

.similarity-badge .bg-yellow-200 {
  box-shadow: 0 0 0 1px rgba(252, 211, 77, 0.5);
}

/* Dim other content when a section is highlighted */
.prose p:has(.active-highlight) span:not(.active-highlight) {
  opacity: 0.4;
  transition: opacity 0.3s ease;
}

/* Fix for overlapping highlights */
.highlighted-text:hover {
  z-index: 10;
}

.active-highlight + .active-highlight,
.active-highlight + .highlighted-text,
.highlighted-text + .active-highlight {
  margin-left: 2px;
}

@media (max-width: 640px) {
  .prose p {
    text-align: left;
  }
}
</style>
