<template>
  <div class="flex-1 p-8 relative">
    <!-- Demo Data Badge -->
    <div
      v-if="isUsingMockData"
      class="absolute top-2 right-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm flex items-center"
    >
      <FileText class="h-4 w-4 mr-1" />
      Dữ liệu mẫu
    </div>

    <h1 class="text-2xl font-bold text-gray-900 mb-6">Thống kê hệ thống</h1>

    <!-- Dashboard Overview Card -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div
        v-for="(stat, index) in summaryStats"
        :key="index"
        class="bg-white rounded-lg shadow p-6 flex items-center space-x-4"
      >
        <div :class="`p-4 rounded-full ${stat.bgColor}`">
          <component :is="stat.icon" class="w-6 h-6" :class="stat.iconColor" />
        </div>
        <div>
          <p class="text-gray-500 text-sm">{{ stat.label }}</p>
          <p class="text-2xl font-bold">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <!-- Document Types Algorithm Comparison - Đổi thành Biểu đồ phân tích tỷ lệ trùng lặp PDF -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-gray-800">Phân bố tỷ lệ trùng lặp</h2>
      </div>
      <div class="h-80 w-full">
        <div class="h-full w-full bg-gray-50 flex items-center justify-center relative">
          <div class="absolute inset-0">
            <canvas ref="docTypeChartRef" class="h-full w-full"></canvas>
          </div>
          <div v-if="!chartDataLoaded" class="text-gray-400">
            <div class="flex flex-col items-center">
              <div
                class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-3"
              ></div>
              Đang tải biểu đồ...
            </div>
          </div>
        </div>
      </div>
      <div class="mt-4 text-sm text-gray-600">
        <p>Biểu đồ trên hiển thị phân bố tỷ lệ trùng lặp của các tài liệu trong hệ thống:</p>
        <ul class="mt-2 list-disc pl-5 space-y-1">
          <li>
            <span class="font-medium text-red-600">Các cột màu đỏ (70-100%)</span>: Tài liệu có khả
            năng cao là đạo văn
          </li>
          <li>
            <span class="font-medium text-orange-600">Các cột màu cam (40-69%)</span>: Tài liệu cần
            xem xét kỹ hơn
          </li>
          <li>
            <span class="font-medium text-blue-600">Các cột màu xanh (0-39%)</span>: Tài liệu có khả
            năng không đạo văn
          </li>
        </ul>
      </div>
    </div>

    <!-- Algorithm Performance Comparison -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <h2 class="text-xl font-semibold text-gray-800 mb-6">Hiệu suất thuật toán</h2>
      <div class="h-96 w-full">
        <div class="h-full w-full bg-gray-50 flex items-center justify-center relative">
          <div class="absolute inset-0">
            <canvas ref="algorithmChartRef" class="h-full w-full"></canvas>
          </div>
          <div v-if="!chartDataLoaded" class="text-gray-400">
            <div class="flex flex-col items-center">
              <div
                class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-3"
              ></div>
              Đang tải biểu đồ...
            </div>
          </div>
        </div>
      </div>
      <div class="mt-4 text-sm text-gray-600">
        <p>Biểu đồ trên thể hiện hiệu suất của các thuật toán phát hiện đạo văn:</p>
        <ul class="mt-2 list-disc pl-5 space-y-1 grid grid-cols-1 md:grid-cols-3">
          <li>
            <span class="font-medium text-blue-600">Độ chính xác</span>: Tỷ lệ phát hiện đúng các
            tài liệu đạo văn
          </li>
          <li>
            <span class="font-medium text-blue-600">Độ bao phủ</span>: Khả năng phát hiện tất cả các
            trường hợp đạo văn
          </li>
          <li>
            <span class="font-medium text-blue-600">Điểm F1</span>: Trung bình điều hòa của độ chính
            xác và độ bao phủ
          </li>
          <li>
            <span class="font-medium text-blue-600">Tốc độ xử lý</span>: Thời gian cần để phân tích
            tài liệu
          </li>
        </ul>
      </div>
    </div>

    <!-- Filter Controls for Documents Table -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <h2 class="text-xl font-semibold text-gray-800 mb-6">Tài liệu có tỷ lệ trùng lặp cao nhất</h2>

      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <div class="flex items-center mb-4 md:mb-0">
          <label for="sortOrder" class="text-sm text-gray-600 mr-2">Sắp xếp theo:</label>
          <select
            id="sortOrder"
            v-model="sortOption"
            class="border rounded p-1.5 text-sm bg-white"
            @change="sortDocuments"
          >
            <option value="similarity">Tỷ lệ tương đồng</option>
            <option value="matches">Số tài liệu trùng lặp</option>
            <option value="date">Ngày tải lên</option>
          </select>
        </div>
        <div class="flex items-center">
          <label for="filterThreshold" class="text-sm text-gray-600 mr-2">Ngưỡng tương đồng:</label>
          <input
            id="filterThreshold"
            v-model="similarityThreshold"
            type="range"
            min="0"
            max="100"
            step="5"
            class="w-32 md:w-40"
            @change="filterDocuments"
          />
          <span class="ml-2 text-sm w-12 text-right">{{ similarityThreshold }}%</span>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tên tài liệu
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tỷ lệ trùng lặp
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Số tài liệu trùng lặp
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Ngày tải lên
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Hành động
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(doc, index) in displayedDocuments" :key="index" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div
                    class="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center"
                  >
                    <FileText class="h-5 w-5 text-indigo-600" />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ doc.name }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ doc.similarityRate.toFixed(1) }}%</div>
                <div
                  :class="`inline-flex text-xs leading-5 font-semibold rounded-full px-2 ${getSimilarityBadgeClass(doc.similarityRate)}`"
                >
                  {{ getSimilarityStatus(doc.similarityRate) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ doc.matchCount }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(doc.uploadDate) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <router-link
                  :to="`/view-results?doc=${encodeURIComponent(doc.name)}`"
                  class="text-indigo-600 hover:text-indigo-900 mr-3"
                >
                  Xem
                </router-link>
              </td>
            </tr>
            <tr v-if="displayedDocuments.length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
                Không có dữ liệu thống kê
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Controls -->
      <div class="flex justify-between items-center mt-4">
        <div class="text-sm text-gray-600">
          Hiển thị {{ Math.min(pageSize, displayedDocuments.length) }} /
          {{ filteredDocuments.length }} tài liệu
        </div>
        <div class="flex space-x-2">
          <button
            @click="currentPage = Math.max(currentPage - 1, 1)"
            :disabled="currentPage === 1"
            :class="[
              'px-3 py-1 rounded text-sm',
              currentPage === 1
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200',
            ]"
          >
            Trước
          </button>
          <button
            @click="currentPage = Math.min(currentPage + 1, totalPages)"
            :disabled="currentPage === totalPages"
            :class="[
              'px-3 py-1 rounded text-sm',
              currentPage === totalPages
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200',
            ]"
          >
            Sau
          </button>
        </div>
      </div>
    </div>

    <!-- Nếu chưa có kết quả kiểm tra đạo văn -->
    <div v-if="!hasResults" class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
      <div class="flex items-center">
        <AlertTriangle class="h-6 w-6 text-yellow-500 mr-4" />
        <div>
          <h3 class="font-semibold text-yellow-800">Chưa có kết quả kiểm tra đạo văn</h3>
          <p class="text-yellow-700 mt-1">
            Để xem thống kê đầy đủ, vui lòng thực hiện kiểm tra đạo văn trước.
          </p>
          <div class="mt-3 space-x-4">
            <router-link
              to="/plagiarism-check"
              class="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded font-medium hover:bg-yellow-200 transition-colors"
            >
              <FileSearch class="h-5 w-5 mr-2" />
              Đi đến trang kiểm tra đạo văn
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { FileText, Clock, FileCheck, AlertTriangle, FileSearch } from 'lucide-vue-next'
import Chart from 'chart.js/auto'
import {
  getSummaryStatistics,
  getAlgorithmPerformance,
  getTopPlagiarizedDocuments,
  getAlgorithmComparisonByDocType,
  getSimilarityByDocumentType,
} from '../api/statistics'
import { getResults } from '../store/plagiarismResults'
import { getAllDocuments } from '../api/documents'

// Charts instances
let algorithmChart = null
let docTypeChart = null

// State
const chartDataLoaded = ref(false)
const algorithmChartRef = ref(null)
const docTypeChartRef = ref(null)
const topDocuments = ref([])
const allDocuments = ref([])

// Pagination and filtering
const currentPage = ref(1)
const pageSize = ref(10)
const sortOption = ref('similarity')
const similarityThreshold = ref(50)
const filteredDocuments = ref([])

// Computed properties
const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredDocuments.value.length / pageSize.value))
})

const displayedDocuments = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  return filteredDocuments.value.slice(startIndex, endIndex)
})

// Kiểm tra xem có kết quả nào không
const hasResults = computed(() => {
  const results = getResults()
  return (
    results &&
    ((results.all_document_pairs && results.all_document_pairs.length > 0) ||
      (results.summary && results.summary.total_pairs > 0))
  )
})

// Kiểm tra xem đang sử dụng dữ liệu mẫu hay không
const isUsingMockData = computed(() => {
  const results = getResults()
  return results && results.document_count === 24 && results.summary?.total_pairs === 276
})

// Format execution time
const formatExecutionTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return `${minutes}m ${remainingSeconds}s`
}

// Summary statistics
const summaryStats = ref([
  {
    label: 'Tổng tài liệu',
    value: '0',
    icon: FileText,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    label: 'Thời gian thực hiện',
    value: '0',
    icon: Clock,
    iconColor: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    label: 'Cặp đã kiểm tra',
    value: '0',
    icon: FileCheck,
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    label: 'Phát hiện đạo văn',
    value: '0',
    icon: AlertTriangle,
    iconColor: 'text-red-600',
    bgColor: 'bg-red-100',
  },
])

// Format date for display
const formatDate = (date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

// Get appropriate badge class based on similarity rate
const getSimilarityBadgeClass = (rate) => {
  if (rate >= 70) return 'bg-red-100 text-red-800'
  if (rate >= 50) return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

// Get similarity status text
const getSimilarityStatus = (rate) => {
  if (rate >= 70) return 'Đạo văn'
  if (rate >= 50) return 'Đáng ngờ'
  return 'An toàn'
}

// Lấy ID của tài liệu từ tên
const getDocumentId = (filename) => {
  const doc = allDocuments.value.find((d) => d.filename === filename)
  return doc ? doc._id : ''
}

// Sort documents based on selected option
const sortDocuments = () => {
  const sortMap = {
    similarity: (a, b) => b.similarityRate - a.similarityRate,
    matches: (a, b) => b.matchCount - a.matchCount,
    date: (a, b) => new Date(b.uploadDate) - new Date(a.uploadDate),
  }

  filteredDocuments.value.sort(sortMap[sortOption.value])
  // Reset to first page after sorting
  currentPage.value = 1
}

// Filter documents based on similarity threshold
const filterDocuments = () => {
  if (!topDocuments.value || topDocuments.value.length === 0) return

  filteredDocuments.value = topDocuments.value.filter(
    (doc) => doc.similarityRate >= similarityThreshold.value,
  )

  // Re-sort after filtering
  sortDocuments()

  // Reset to first page and check if current page is valid
  currentPage.value = 1
}

// Load all documents
const loadAllDocuments = async () => {
  try {
    allDocuments.value = await getAllDocuments()
  } catch (error) {
    console.error('Error loading all documents:', error)
  }
}

// Load summary statistics
const loadSummaryStatistics = async () => {
  try {
    const data = await getSummaryStatistics()
    summaryStats.value[0].value = data.totalDocuments.toString()
    summaryStats.value[1].value = formatExecutionTime(data.executionTime)
    summaryStats.value[2].value = data.checksPerformed.toString()
    summaryStats.value[3].value = data.plagiarismDetected.toString()
  } catch (error) {
    console.error('Error loading summary statistics:', error)
  }
}

// Initialize document type chart
const initDocTypeChart = async () => {
  if (docTypeChart) {
    docTypeChart.destroy()
  }

  try {
    const data = await getSimilarityByDocumentType()

    const ctx = docTypeChartRef.value.getContext('2d')
    docTypeChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: data.datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'x',
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: {
                size: 11,
              },
            },
          },
          y: {
            beginAtZero: true,
            suggestedMax: 100,
            ticks: {
              callback: function (value) {
                return value + '%'
              },
              stepSize: 5,
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
          },
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 15,
              padding: 15,
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return context.dataset.label + ': ' + context.parsed.y + '%'
              },
            },
            padding: 10,
            titleFont: {
              size: 14,
            },
            bodyFont: {
              size: 13,
            },
          },
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart',
        },
        layout: {
          padding: {
            top: 5,
            right: 15,
            bottom: 5,
            left: 10,
          },
        },
      },
    })
  } catch (error) {
    console.error('Error initializing document type chart:', error)
  }
}

// Initialize algorithm performance chart
const initAlgorithmChart = async () => {
  if (algorithmChart) {
    algorithmChart.destroy()
  }

  try {
    const data = await getAlgorithmPerformance()

    const ctx = algorithmChartRef.value.getContext('2d')
    algorithmChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Độ chính xác', 'Độ bao phủ', 'Điểm F1', 'Tốc độ xử lý'],
        datasets: data.algorithms.map((algo, index) => ({
          label: algo,
          data: [
            data.precision[index] * 100,
            data.recall[index] * 100,
            data.f1Score[index] * 100,
            // Normalize processing time (invert and scale to 0-100)
            (1 - data.processingTime[index] / Math.max(...data.processingTime)) * 100,
          ],
          fill: true,
          backgroundColor: `rgba(${index === 0 ? '59, 130, 246' : index === 1 ? '139, 92, 246' : '249, 115, 22'}, 0.2)`,
          borderColor: `rgba(${index === 0 ? '59, 130, 246' : index === 1 ? '139, 92, 246' : '249, 115, 22'}, 1)`,
          pointBackgroundColor: `rgba(${index === 0 ? '59, 130, 246' : index === 1 ? '139, 92, 246' : '249, 115, 22'}, 1)`,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: {
              display: false,
              stepSize: 20,
            },
            pointLabels: {
              font: {
                size: 14,
                weight: 'bold',
              },
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
            angleLines: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
          },
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 20,
              padding: 20,
              font: {
                size: 14,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return context.dataset.label + ': ' + Math.round(context.raw) + '%'
              },
            },
            padding: 12,
            titleFont: {
              size: 14,
            },
            bodyFont: {
              size: 13,
            },
          },
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart',
        },
        layout: {
          padding: 10,
        },
      },
    })
  } catch (error) {
    console.error('Error initializing algorithm chart:', error)
  }
}

// Load top plagiarized documents
const loadTopDocuments = async () => {
  try {
    topDocuments.value = await getTopPlagiarizedDocuments()
    // Chỉ hiển thị các tài liệu thực (không phải Sample Document)
    topDocuments.value = topDocuments.value.filter((doc) => !doc.name.startsWith('Sample Document'))
    // Initialize filtered documents
    filteredDocuments.value = [...topDocuments.value]
    // Apply initial sort
    sortDocuments()
  } catch (error) {
    console.error('Error loading top documents:', error)
  }
}

// Initialize charts when component mounts
onMounted(async () => {
  try {
    chartDataLoaded.value = false

    // Load all data
    await Promise.all([loadAllDocuments(), loadSummaryStatistics(), loadTopDocuments()])

    // Initialize charts - chỉ nếu có kết quả
    if (hasResults.value) {
      await Promise.all([initDocTypeChart(), initAlgorithmChart()])
    }

    chartDataLoaded.value = true
  } catch (error) {
    console.error('Error initializing statistics page:', error)
    // Set data loaded to true even if error occurs to remove loader
    chartDataLoaded.value = true
  }
})

// Watch for threshold changes to update filtered documents
watch(similarityThreshold, filterDocuments)
</script>
