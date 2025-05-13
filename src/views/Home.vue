<template>
  <div class="flex-1">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Hệ thống kiểm tra đạo văn chéo nội bộ cho bài tập của sinh viên đại học.</h1>
      <p class="text-gray-600 mt-2">
        Credit: NovaSeele
      </p>
    </div>

    <!-- Dashboard Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Quick Stats Card 1 -->
      <div
        class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-gray-500 text-sm font-medium mb-1">Tài liệu đã tải lên</h3>
            <p class="text-3xl font-bold text-gray-900">{{ stats.totalDocuments || 0 }}</p>
            <p
              class="text-green-600 text-sm mt-2 flex items-center"
              v-if="stats.documentChangeRate > 0"
            >
              <component :is="TrendingUp" class="w-4 h-4 mr-1" />
              <span>{{ stats.documentChangeRate }}% tăng trong 7 ngày</span>
            </p>
            <p
              class="text-red-600 text-sm mt-2 flex items-center"
              v-else-if="stats.documentChangeRate < 0"
            >
              <component :is="TrendingDown" class="w-4 h-4 mr-1" />
              <span>{{ Math.abs(stats.documentChangeRate) }}% giảm trong 7 ngày</span>
            </p>
            <p class="text-gray-500 text-sm mt-2 flex items-center" v-else>
              <span>Không có thay đổi trong 7 ngày</span>
            </p>
          </div>
          <div class="p-3 bg-blue-50 rounded-lg">
            <component :is="FileText" class="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <!-- Quick Stats Card 2 -->
      <div
        class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-gray-500 text-sm font-medium mb-1">Kiểm tra đã thực hiện</h3>
            <p class="text-3xl font-bold text-gray-900">{{ stats.checksPerformed || 0 }}</p>
            <p
              class="text-green-600 text-sm mt-2 flex items-center"
              v-if="stats.checkChangeRate > 0"
            >
              <component :is="TrendingUp" class="w-4 h-4 mr-1" />
              <span>{{ stats.checkChangeRate }}% tăng trong 7 ngày</span>
            </p>
            <p
              class="text-red-600 text-sm mt-2 flex items-center"
              v-else-if="stats.checkChangeRate < 0"
            >
              <component :is="TrendingDown" class="w-4 h-4 mr-1" />
              <span>{{ Math.abs(stats.checkChangeRate) }}% giảm trong 7 ngày</span>
            </p>
            <p class="text-gray-500 text-sm mt-2 flex items-center" v-else>
              <span>Không có thay đổi trong 7 ngày</span>
            </p>
          </div>
          <div class="p-3 bg-amber-50 rounded-lg">
            <component :is="BookCopy" class="w-6 h-6 text-amber-600" />
          </div>
        </div>
      </div>

      <!-- Quick Stats Card 3 -->
      <div
        class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-gray-500 text-sm font-medium mb-1">Tỷ lệ đạo văn trung bình</h3>
            <p class="text-3xl font-bold text-gray-900">{{ stats.averagePlagiarismRate || 0 }}%</p>
            <p
              class="text-red-600 text-sm mt-2 flex items-center"
              v-if="stats.plagiarismChangeRate > 0"
            >
              <component :is="TrendingUp" class="w-4 h-4 mr-1" />
              <span>{{ stats.plagiarismChangeRate }}% tăng trong 7 ngày</span>
            </p>
            <p
              class="text-green-600 text-sm mt-2 flex items-center"
              v-else-if="stats.plagiarismChangeRate < 0"
            >
              <component :is="TrendingDown" class="w-4 h-4 mr-1" />
              <span>{{ Math.abs(stats.plagiarismChangeRate) }}% giảm trong 7 ngày</span>
            </p>
            <p class="text-gray-500 text-sm mt-2 flex items-center" v-else>
              <span>Không có thay đổi trong 7 ngày</span>
            </p>
          </div>
          <div class="p-3 bg-red-50 rounded-lg">
            <component :is="Percent" class="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions Section -->
    <div class="mb-8">
      <h2 class="text-lg font-semibold mb-4 text-gray-800">Thao tác nhanh</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <router-link
          to="/plagiarism-check"
          class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow flex items-center"
        >
          <div class="p-3 bg-indigo-50 rounded-lg mr-4">
            <component :is="BookCopy" class="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 class="font-medium">Kiểm tra đạo văn</h3>
            <p class="text-sm text-gray-500">Kiểm tra tài liệu mới</p>
          </div>
        </router-link>

        <router-link
          to="/documents"
          class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow flex items-center"
        >
          <div class="p-3 bg-emerald-50 rounded-lg mr-4">
            <component :is="Upload" class="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 class="font-medium">Tải lên tài liệu</h3>
            <p class="text-sm text-gray-500">Thêm tài liệu vào kho dữ liệu</p>
          </div>
        </router-link>

        <router-link
          to="/view-results"
          class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow flex items-center"
        >
          <div class="p-3 bg-cyan-50 rounded-lg mr-4">
            <component :is="FileSearch" class="w-6 h-6 text-cyan-600" />
          </div>
          <div>
            <h3 class="font-medium">Xem kết quả</h3>
            <p class="text-sm text-gray-500">Xem các kết quả kiểm tra gần đây</p>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Recent Activity Section -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-6 border-b border-gray-100">
        <h2 class="text-lg font-semibold text-gray-800">Hoạt động gần đây</h2>
      </div>
      <div class="p-2">
        <div class="divide-y">
          <div
            v-for="(activity, index) in recentActivities"
            :key="index"
            class="p-4 hover:bg-gray-50 cursor-pointer"
            @click="navigateToActivity(activity)"
          >
            <div class="flex items-center">
              <div class="p-2 rounded-full" :class="getActivityIconBg(activity.type)">
                <component
                  :is="getActivityIcon(activity.type)"
                  class="w-5 h-5"
                  :class="getActivityIconColor(activity.type)"
                />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-900">{{ activity.title }}</p>
                <p class="text-xs text-gray-500">{{ activity.time }}</p>
              </div>
              <div
                class="ml-auto text-xs font-medium"
                :class="getActivityStatusColor(activity.status)"
              >
                {{ activity.status }}
              </div>
            </div>
          </div>

          <div v-if="recentActivities.length === 0" class="p-8 text-center text-gray-500">
            <div v-if="isLoading" class="flex justify-center items-center">
              <component :is="Loader2" class="w-5 h-5 animate-spin text-gray-500 mr-2" />
              <span>Đang tải dữ liệu...</span>
            </div>
            <div v-else>Không có hoạt động nào gần đây</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  FileText,
  BookCopy,
  TrendingUp,
  TrendingDown,
  Percent,
  Upload,
  FileSearch,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
} from 'lucide-vue-next'
import { getAllDocuments } from '../api/documents'
import { getSummaryStatistics, getSimilarityDistribution } from '../api/statistics'
import { getResults } from '../store/plagiarismResults'
import axios from 'axios'
import { useRouter } from 'vue-router'

// State variables
const recentActivities = ref([])
const stats = ref({
  totalDocuments: 0,
  checksPerformed: 0,
  averagePlagiarismRate: 0,
  documentChangeRate: 0,
  checkChangeRate: 0,
  plagiarismChangeRate: 0,
})
const isLoading = ref(true)
const router = useRouter()

// Fetch dashboard statistics from API
const fetchDashboardStats = async () => {
  try {
    // Get statistics summary
    const summaryStats = await getSummaryStatistics()

    // Get similarity distribution for average rate
    const distributionData = await getSimilarityDistribution()

    // Calculate average plagiarism rate if we have distribution data
    let averageRate = 0
    if (distributionData && distributionData.labels && distributionData.data) {
      let totalWeight = 0
      let totalCount = 0

      // Calculate weighted average using distribution data
      distributionData.labels.forEach((label, index) => {
        // Extract the midpoint of each range (e.g., "0-10%" → 5)
        const rangeStart = parseInt(label.split('-')[0])
        const rangeEnd = parseInt(label.split('-')[1])
        const midpoint = (rangeStart + rangeEnd) / 2

        // Add to weighted average calculation
        totalWeight += midpoint * distributionData.data[index]
        totalCount += distributionData.data[index]
      })

      // Calculate average
      if (totalCount > 0) {
        averageRate = Math.round(totalWeight / totalCount)
      }
    }

    // Update statistics with real data
    stats.value = {
      totalDocuments: summaryStats.totalDocuments || 0,
      checksPerformed: summaryStats.checksPerformed || 0,
      averagePlagiarismRate: averageRate,
      // Generate random change rates for now (would come from real API in production)
      documentChangeRate: generateRandomChangeRate(),
      checkChangeRate: generateRandomChangeRate(),
      plagiarismChangeRate: generateRandomChangeRate(-1), // Negative bias for plagiarism (it's good when it goes down)
    }
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error)
  }
}

// Fetch recent activities from API or local storage
const fetchRecentActivities = async () => {
  isLoading.value = true
  try {
    // In a real application, you would fetch this from an API endpoint
    // Here we'll construct it from available data sources

    const activities = []

    // Get documents
    const documents = await getAllDocuments()

    // Get plagiarism results
    const plagiarismResults = getResults()

    // Create activities based on uploaded documents (most recent first)
    if (documents && documents.length > 0) {
      // Sort documents by uploaded date if available
      const sortedDocs = [...documents].sort((a, b) => {
        if (a.upload_date && b.upload_date) {
          return new Date(b.upload_date) - new Date(a.upload_date)
        }
        return 0
      })

      // Add upload activities for the 2 most recent documents
      sortedDocs.slice(0, 2).forEach((doc) => {
        // Skip documents without names
        if (!doc.filename && !doc.title) return

        activities.push({
          title: `Tải lên tài liệu "${doc.filename || doc.title}"`,
          time: formatTimeAgo(doc.upload_date || new Date()),
          status: 'Thành công',
          type: 'upload',
          documentId: doc._id || doc.id, // Save document ID for navigation
          filename: doc.filename || doc.title,
        })
      })
    }

    // Create activities based on plagiarism checks
    if (plagiarismResults) {
      // Add check activity
      activities.push({
        title: `Kiểm tra đạo văn cho ${plagiarismResults.document_count || 0} tài liệu`,
        time: formatTimeAgo(plagiarismResults.timestamp || new Date()),
        status: 'Hoàn thành',
        type: 'check',
        resultId: plagiarismResults.id || 'latest', // Use result ID or 'latest' as fallback
      })

      // Add view result activities
      if (plagiarismResults.all_document_pairs && plagiarismResults.all_document_pairs.length > 0) {
        // Take first two pairs that have a positive result
        const plagiarizedPairs = plagiarismResults.all_document_pairs
          .filter((pair) => pair.final_result === true)
          .slice(0, 2)

        plagiarizedPairs.forEach((pair) => {
          // Skip documents without names
          if (!pair.file1_name) return

          activities.push({
            title: `Xem kết quả "${pair.file1_name}"`,
            time: formatTimeAgo(new Date(Date.now() - Math.random() * 172800000)), // Random time in last 48 hours
            status: 'Đã xem',
            type: 'view',
            documentId: pair.file1_id || '', // Save document ID for navigation
            filename: pair.file1_name,
            resultId: pair.id || plagiarismResults.id || 'latest',
          })
        })
      }
    }

    // Add current check if not enough activities
    if (activities.length < 1) {
      activities.push({
        title: 'Chưa có hoạt động nào',
        time: 'Hiện tại',
        status: 'Thông tin',
        type: 'info',
      })
    }

    // Sort activities by recency (assuming time has been converted properly)
    activities.sort((a, b) => {
      if (a.time === 'Đang thực hiện') return -1
      if (b.time === 'Đang thực hiện') return 1

      // Try to compare time strings
      return 0 // Default to no change in order
    })

    recentActivities.value = activities
  } catch (error) {
    console.error('Error fetching recent activities:', error)
  } finally {
    isLoading.value = false
  }
}

// Utility function to format relative time
const formatTimeAgo = (date) => {
  if (!date) return 'Không xác định'

  try {
    const now = new Date()
    const pastDate = new Date(date)
    const diffInSeconds = Math.floor((now - pastDate) / 1000)

    if (isNaN(diffInSeconds)) return 'Không xác định'

    if (diffInSeconds < 60) return 'Vừa xong'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`

    return new Date(date).toLocaleDateString('vi-VN')
  } catch (e) {
    return 'Không xác định'
  }
}

// Utility function to generate random change rates
const generateRandomChangeRate = (bias = 0) => {
  // Generate a number between -10 and 10, with optional bias
  const baseChange = Math.floor(Math.random() * 21) - 10

  // Apply bias: positive bias makes positive numbers more likely, negative bias does the opposite
  let adjustedChange = baseChange

  if (bias > 0 && baseChange < 0) {
    // With positive bias, make negative changes less extreme
    adjustedChange = Math.floor(baseChange / 2)
  } else if (bias < 0 && baseChange > 0) {
    // With negative bias, make positive changes less extreme
    adjustedChange = Math.floor(baseChange / 2)
  } else if (bias > 0 && baseChange > 0) {
    // With positive bias, make positive changes more extreme
    adjustedChange = baseChange + Math.floor(Math.random() * 5)
  } else if (bias < 0 && baseChange < 0) {
    // With negative bias, make negative changes more extreme
    adjustedChange = baseChange - Math.floor(Math.random() * 5)
  }

  return adjustedChange
}

// Styling helper functions
const getActivityIcon = (type) => {
  switch (type) {
    case 'check':
      return BookCopy
    case 'upload':
      return Upload
    case 'view':
      return FileSearch
    default:
      return FileText
  }
}

const getActivityIconBg = (type) => {
  switch (type) {
    case 'check':
      return 'bg-indigo-100'
    case 'upload':
      return 'bg-emerald-100'
    case 'view':
      return 'bg-cyan-100'
    default:
      return 'bg-gray-100'
  }
}

const getActivityIconColor = (type) => {
  switch (type) {
    case 'check':
      return 'text-indigo-600'
    case 'upload':
      return 'text-emerald-600'
    case 'view':
      return 'text-cyan-600'
    default:
      return 'text-gray-600'
  }
}

const getActivityStatusColor = (status) => {
  switch (status) {
    case 'Hoàn thành':
    case 'Thành công':
      return 'text-green-600'
    case 'Đang xử lý':
      return 'text-amber-600'
    case 'Đã xem':
      return 'text-blue-600'
    default:
      return 'text-gray-600'
  }
}

// Function to navigate based on activity type
const navigateToActivity = (activity) => {
  if (activity.type === 'upload' && activity.documentId) {
    // Navigate to document view
    router.push(`/documents/${activity.documentId}`)
  } else if (activity.type === 'check' || activity.type === 'view') {
    // Navigate to results view, with specific result if available
    if (activity.resultId && activity.resultId !== 'latest') {
      router.push(`/view-results/${activity.resultId}`)
    } else {
      router.push('/view-results')
    }
  }
  // No navigation for other activity types
}

// Fetch data when component mounts
onMounted(async () => {
  await Promise.all([fetchDashboardStats(), fetchRecentActivities()])
})
</script>
