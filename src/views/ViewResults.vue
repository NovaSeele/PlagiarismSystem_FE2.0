<template>
  <div class="flex-1 p-3 md:p-4 max-w-7xl mx-auto">
    <h1 class="text-xl font-bold text-gray-900 mb-3">Kết quả kiểm tra đạo văn</h1>

    <!-- Dashboard Header with Summary Stats - More compact -->
    <div class="bg-white rounded-lg shadow-sm p-2 mb-4 flex justify-between items-center text-sm">
      <div class="flex items-center gap-4">
        <div class="text-center px-2">
          <span class="text-xs font-medium text-gray-500">Tài liệu</span>
          <p class="text-base font-bold text-gray-900">{{ results.document_count }}</p>
        </div>
        <div class="text-center px-2 border-l border-gray-200">
          <span class="text-xs font-medium text-gray-500">Thời gian</span>
          <p class="text-base font-bold text-gray-900">
            {{ formatTime(results.execution_time_seconds) }}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <div class="text-center px-2 border-l border-gray-200">
          <span class="text-xs font-medium text-gray-500">Cặp so sánh</span>
          <p class="text-base font-bold text-gray-900">{{ results.summary.total_pairs }}</p>
        </div>
        <div class="text-center px-2 border-l border-gray-200">
          <span class="text-xs font-medium text-gray-500">Trùng lặp</span>
          <p class="text-base font-bold text-purple-700">
            {{ results.summary.final_result_count }}
          </p>
        </div>
      </div>
    </div>

    <!-- Simplified Control panel -->
    <div class="bg-white rounded-lg shadow-sm p-2 mb-4 flex flex-wrap justify-between items-center">
      <div class="flex gap-3">
        <div>
          <select
            v-model="filterType"
            class="px-3 py-1 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tất cả</option>
            <option value="matched">Chỉ trùng lặp</option>
            <option value="not-matched">Không trùng lặp</option>
          </select>
        </div>
        <div class="flex items-center gap-1">
          <select
            v-model="sortBy"
            class="px-3 py-1 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="bert">BERT</option>
            <option value="fasttext">FastText</option>
            <option value="lsa">LSA</option>
            <option value="filename">Tên tài liệu</option>
            <option value="matchCount">Số lượng trùng lặp</option>
          </select>
          <button
            @click="toggleSortDirection"
            class="p-1 border rounded-md hover:bg-gray-100 focus:outline-none"
            :title="sortDirection === 'desc' ? 'Giảm dần' : 'Tăng dần'"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              :class="{ 'rotate-180': sortDirection === 'asc' }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>
      <div>
        <select
          v-model="viewMode"
          class="px-3 py-1 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="pairs">Cặp so sánh</option>
          <option value="documents">Tài liệu</option>
        </select>
      </div>
    </div>

    <!-- Results View - Pairs Mode (Optimized for horizontal layout) -->
    <div v-if="viewMode === 'pairs'" class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="p-3">
        <h2 class="text-sm font-semibold text-gray-700 mb-3">Chi tiết kết quả so sánh</h2>

        <!-- Pairs Horizontal Layout -->
        <div class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-2">
          <div
            v-for="pair in sortedFilteredPairs"
            :key="`${pair.doc1_filename}-${pair.doc2_filename}`"
            class="border rounded-lg p-2 hover:bg-gray-50 transition-colors cursor-pointer"
            :class="{ 'border-red-300 bg-red-50 hover:bg-red-100': pair.final_result }"
            @click="viewPairDetails(pair.doc1_filename, pair.doc2_filename)"
          >
            <!-- Horizontal layout for file names -->
            <div class="flex items-center justify-between gap-1 mb-1">
              <div class="flex items-center gap-1 truncate flex-1">
                <span class="text-sm font-medium text-gray-900 truncate max-w-[45%]">{{
                  pair.doc1_filename
                }}</span>
                <svg
                  class="h-3 w-3 text-gray-400 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 12H19M19 12L12 5M19 12L12 19"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span class="text-sm font-medium text-gray-900 truncate max-w-[45%]">{{
                  pair.doc2_filename
                }}</span>
              </div>
              <div :class="getResultBadgeClass(pair.final_result)">
                {{ pair.final_result ? 'Trùng lặp' : 'Không trùng lặp' }}
              </div>
            </div>

            <!-- Metrics with BERT more prominent and others as text only -->
            <div class="flex items-center gap-3">
              <!-- BERT Similarity (Keep the progress bar) -->
              <div class="flex-[2]">
                <div class="flex justify-between mb-0.5 items-center">
                  <span class="text-xs font-medium text-purple-800">BERT</span>
                  <span class="text-xs font-bold">{{ pair.bert_similarity_percentage }}%</span>
                </div>
                <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-purple-600 rounded-full"
                    :style="{ width: `${pair.bert_similarity_percentage}%` }"
                  ></div>
                </div>
              </div>

              <!-- Other Similarities as text only -->
              <div class="flex gap-2 items-center">
                <span class="text-xs font-medium text-green-700"
                  >FT: {{ pair.fasttext_similarity_percentage }}%</span
                >
                <span class="text-xs font-medium text-blue-700"
                  >LSA: {{ pair.lsa_similarity_percentage }}%</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- No Results Message -->
        <div v-if="sortedFilteredPairs.length === 0" class="text-center py-6">
          <p class="text-gray-500">Không tìm thấy kết quả phù hợp với bộ lọc hiện tại.</p>
        </div>
      </div>
    </div>

    <!-- Results View - Documents Mode (Optimized for horizontal layout) -->
    <div v-if="viewMode === 'documents'" class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="p-3">
        <h2 class="text-sm font-semibold text-gray-700 mb-3">Phân tích theo tài liệu</h2>

        <!-- Document-based grouping -->
        <div class="space-y-4">
          <div
            v-for="(docData, docName) in sortedFilteredGroupedDocuments"
            :key="docName"
            class="border rounded-lg p-2"
            :class="{ 'border-red-300 bg-red-50': docData.hasPlagiarism }"
          >
            <!-- Document header with horizontal layout -->
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-base font-medium text-gray-900 truncate max-w-[70%]" :title="docName">
                {{ docName }}
              </h3>
              <div
                v-if="docData.hasPlagiarism"
                class="px-2 py-0.5 text-xs font-medium text-red-800 bg-red-100 rounded-full"
              >
                {{ docData.matchCount }} trùng lặp
              </div>
              <div
                v-else
                class="px-2 py-0.5 text-xs font-medium text-green-800 bg-green-100 rounded-full"
              >
                Không trùng lặp
              </div>
            </div>

            <!-- No matches message -->
            <div v-if="docData.matches.length === 0" class="text-center py-2 text-xs text-gray-500">
              Không phát hiện trùng lặp
            </div>

            <!-- Matches with horizontal layout -->
            <div v-else class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-2">
              <div
                v-for="match in docData.sortedMatches"
                :key="match.otherDoc"
                class="border rounded-lg p-2 hover:bg-gray-50 transition-colors cursor-pointer"
                :class="{ 'border-red-200 bg-red-50 hover:bg-red-100': match.final_result }"
                @click="viewPairDetails(docName, match.otherDoc)"
              >
                <!-- Horizontal layout for document name and status -->
                <div class="flex items-center justify-between mb-1">
                  <span
                    class="text-sm font-medium text-gray-900 truncate max-w-[70%]"
                    :title="match.otherDoc"
                  >
                    {{ match.otherDoc }}
                  </span>
                  <div :class="getResultBadgeClass(match.final_result)">
                    {{ match.final_result ? 'Trùng lặp' : 'Không trùng lặp' }}
                  </div>
                </div>

                <!-- Horizontal layout for similarity measures -->
                <div class="flex items-center gap-2">
                  <!-- BERT Similarity (Primary) -->
                  <div class="flex-[2]">
                    <div class="flex justify-between mb-0.5 items-center">
                      <span class="text-xs font-medium text-purple-800">BERT</span>
                      <span class="text-xs font-bold">{{ match.bert_similarity_percentage }}%</span>
                    </div>
                    <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        class="h-full bg-purple-600 rounded-full"
                        :style="{ width: `${match.bert_similarity_percentage}%` }"
                      ></div>
                    </div>
                  </div>

                  <!-- Other metrics as text only -->
                  <div class="flex gap-2 items-center">
                    <span class="text-xs font-medium text-green-700"
                      >FT: {{ match.fasttext_similarity_percentage }}%</span
                    >
                    <span class="text-xs font-medium text-blue-700"
                      >LSA: {{ match.lsa_similarity_percentage }}%</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No Results Message for Document View -->
        <div
          v-if="Object.keys(sortedFilteredGroupedDocuments).length === 0"
          class="text-center py-6"
        >
          <p class="text-gray-500">Không tìm thấy tài liệu phù hợp với bộ lọc hiện tại.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import mockData from '../mockData/mock_results.json'

const router = useRouter()
const results = ref(mockData)
const filterType = ref('all')
const sortBy = ref('bert') // Default sort by BERT (highest weight)
const sortDirection = ref('desc') // Default sort direction (descending)
const viewMode = ref('documents') // Default to document view for better organization

// Format execution time
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return `${minutes}m ${remainingSeconds}s`
}

// Toggle sorting direction
const toggleSortDirection = () => {
  sortDirection.value = sortDirection.value === 'desc' ? 'asc' : 'desc'
}

// Get badge class based on result
const getResultBadgeClass = (isMatched) => {
  return isMatched
    ? 'px-1.5 py-0.5 text-[10px] font-medium text-red-800 bg-red-100 rounded-full'
    : 'px-1.5 py-0.5 text-[10px] font-medium text-green-800 bg-green-100 rounded-full'
}

// Helper function to sort based on sortBy and sortDirection
const sortByAttribute = (a, b, attribute) => {
  let comparison = 0

  if (attribute === 'bert') {
    comparison = a.bert_similarity_percentage - b.bert_similarity_percentage
  } else if (attribute === 'fasttext') {
    comparison = a.fasttext_similarity_percentage - b.fasttext_similarity_percentage
  } else if (attribute === 'lsa') {
    comparison = a.lsa_similarity_percentage - b.lsa_similarity_percentage
  } else if (attribute === 'filename' && a.doc1_filename && b.doc1_filename) {
    comparison = a.doc1_filename.localeCompare(b.doc1_filename)
  } else if (attribute === 'filename' && a.otherDoc && b.otherDoc) {
    comparison = a.otherDoc.localeCompare(b.otherDoc)
  }

  return sortDirection.value === 'desc' ? -comparison : comparison
}

// Filter results as pairs
const filteredPairs = computed(() => {
  return results.value.all_document_pairs.filter((pair) => {
    // Filter by match status
    if (filterType.value === 'matched' && !pair.final_result) return false
    if (filterType.value === 'not-matched' && pair.final_result) return false
    return true
  })
})

// Sort filtered pairs
const sortedFilteredPairs = computed(() => {
  return [...filteredPairs.value].sort((a, b) => {
    return sortByAttribute(a, b, sortBy.value)
  })
})

// Group by document for document-oriented view
const groupedDocuments = computed(() => {
  const docs = {}

  // Process all document pairs
  results.value.all_document_pairs.forEach((pair) => {
    // Handle first document
    if (!docs[pair.doc1_filename]) {
      docs[pair.doc1_filename] = { matches: [], hasPlagiarism: false }
    }

    // Add match from doc1 perspective
    const match1 = {
      otherDoc: pair.doc2_filename,
      lsa_similarity_percentage: pair.lsa_similarity_percentage,
      fasttext_similarity_percentage: pair.fasttext_similarity_percentage,
      bert_similarity_percentage: pair.bert_similarity_percentage,
      final_result: pair.final_result,
    }
    docs[pair.doc1_filename].matches.push(match1)

    if (pair.final_result) {
      docs[pair.doc1_filename].hasPlagiarism = true
    }

    // Handle second document
    if (!docs[pair.doc2_filename]) {
      docs[pair.doc2_filename] = { matches: [], hasPlagiarism: false }
    }

    // Add match from doc2 perspective
    const match2 = {
      otherDoc: pair.doc1_filename,
      lsa_similarity_percentage: pair.lsa_similarity_percentage,
      fasttext_similarity_percentage: pair.fasttext_similarity_percentage,
      bert_similarity_percentage: pair.bert_similarity_percentage,
      final_result: pair.final_result,
    }
    docs[pair.doc2_filename].matches.push(match2)

    if (pair.final_result) {
      docs[pair.doc2_filename].hasPlagiarism = true
    }
  })

  // Calculate match count and sort matches for each document
  Object.values(docs).forEach((doc) => {
    // Count matches that are marked as plagiarism
    doc.matchCount = doc.matches.filter((m) => m.final_result).length

    // Sort matches according to current sort criteria
    doc.sortedMatches = [...doc.matches].sort((a, b) => {
      return sortByAttribute(a, b, sortBy.value)
    })
  })

  return docs
})

// Apply filters to grouped documents
const filteredGroupedDocuments = computed(() => {
  const filteredDocs = {}

  Object.entries(groupedDocuments.value).forEach(([docName, docData]) => {
    // Apply match status filter
    if (filterType.value === 'matched' && !docData.hasPlagiarism) {
      return
    }

    if (filterType.value === 'not-matched' && docData.hasPlagiarism) {
      return
    }

    // Filter matches based on filter settings
    const filteredMatches = docData.matches.filter((match) => {
      if (filterType.value === 'matched' && !match.final_result) {
        return false
      }

      if (filterType.value === 'not-matched' && match.final_result) {
        return false
      }

      return true
    })

    // Sort matches
    const sortedMatches = [...filteredMatches].sort((a, b) => {
      return sortByAttribute(a, b, sortBy.value)
    })

    filteredDocs[docName] = {
      ...docData,
      matches: filteredMatches,
      sortedMatches: sortedMatches,
    }
  })

  return filteredDocs
})

// Sort documents by selected criteria
const sortedFilteredGroupedDocuments = computed(() => {
  const docs = { ...filteredGroupedDocuments.value }

  // Convert to array for sorting
  const docsArray = Object.entries(docs).map(([docName, docData]) => ({
    docName,
    ...docData,
  }))

  // Sort the array
  docsArray.sort((a, b) => {
    if (sortBy.value === 'matchCount') {
      // Sort by number of plagiarism matches
      const comparison = a.matchCount - b.matchCount
      return sortDirection.value === 'desc' ? -comparison : comparison
    } else if (sortBy.value === 'filename') {
      // Sort by document name
      const comparison = a.docName.localeCompare(b.docName)
      return sortDirection.value === 'desc' ? -comparison : comparison
    } else {
      // Sort by highest/average similarity for the current metric
      // For simplicity, we'll use the highest value
      const getHighestMetric = (doc) => {
        if (doc.matches.length === 0) return 0

        if (sortBy.value === 'bert') {
          return Math.max(...doc.matches.map((m) => m.bert_similarity_percentage))
        } else if (sortBy.value === 'fasttext') {
          return Math.max(...doc.matches.map((m) => m.fasttext_similarity_percentage))
        } else if (sortBy.value === 'lsa') {
          return Math.max(...doc.matches.map((m) => m.lsa_similarity_percentage))
        }
        return 0
      }

      const aValue = getHighestMetric(a)
      const bValue = getHighestMetric(b)
      const comparison = aValue - bValue
      return sortDirection.value === 'desc' ? -comparison : comparison
    }
  })

  // Convert back to object
  const sortedDocs = {}
  docsArray.forEach((doc) => {
    sortedDocs[doc.docName] = {
      matches: doc.matches,
      sortedMatches: doc.sortedMatches,
      hasPlagiarism: doc.hasPlagiarism,
      matchCount: doc.matchCount,
    }
  })

  return sortedDocs
})

// Navigate to detail view for a pair
const viewPairDetails = (doc1, doc2) => {
  router.push({
    name: 'ViewResultDetails',
    params: {
      file1: doc1,
      file2: doc2,
    },
  })
}
</script>
