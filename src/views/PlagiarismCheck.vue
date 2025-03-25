<template>
  <div class="p-6 max-w-6xl mx-auto space-y-8">
    <h1 class="text-3xl font-bold text-gray-800">Plagiarism Report</h1>

    <!-- File Categories -->
    <div class="bg-white rounded-xl shadow p-4">
      <h2 class="text-xl font-semibold mb-4 text-gray-700">File Categories</h2>
      <ul class="space-y-2">
        <li
          v-for="(categories, file) in fileCategories"
          :key="file"
          class="bg-gray-50 p-3 rounded-lg"
        >
          <p class="font-medium text-gray-900">{{ file }}</p>
          <div class="flex flex-wrap mt-1 gap-2">
            <span
              v-for="category in categories"
              :key="category"
              class="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded"
            >
              {{ category }}
            </span>
          </div>
        </li>
      </ul>
    </div>

    <!-- Similarity Matrix -->
    <div class="bg-white rounded-xl shadow p-4 overflow-auto">
      <h2 class="text-xl font-semibold mb-4 text-gray-700">Similarity Matrix</h2>
      <table class="min-w-full text-sm text-center border border-gray-200">
        <thead class="bg-gray-100">
          <tr>
            <th class="border px-4 py-2">File</th>
            <th v-for="file in fileList" :key="file" class="border px-4 py-2">{{ file }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowFile) in comparisonMatrix" :key="rowFile">
            <td class="border px-4 py-2 font-medium text-gray-700">{{ rowFile }}</td>
            <td v-for="file in fileList" :key="file" class="border px-4 py-2">
              {{ row[file].toFixed(2) }}%
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Detailed Report -->
    <div class="bg-white rounded-xl shadow p-4">
      <h2 class="text-xl font-semibold mb-4 text-gray-700">Detailed Report</h2>
      <div class="mb-4">
        <label for="pairSelect" class="block text-sm font-medium text-gray-600 mb-1"
          >Select File Pair</label
        >
        <select id="pairSelect" v-model="selectedPair" class="w-full border-gray-300 rounded p-2">
          <option disabled value="">-- Select a Pair --</option>
          <option v-for="pair in reportPairs" :key="pair" :value="pair">
            {{ pair }}
          </option>
        </select>
      </div>

      <div v-if="selectedPair" class="border-t pt-4 space-y-2">
        <p>
          <span class="font-medium text-gray-700">Similarity:</span>
          {{ detailedReport[selectedPair].similarity_percentage }}
        </p>
        <p>
          <span class="font-medium text-gray-700">Raw Score:</span>
          {{ detailedReport[selectedPair].raw_score.toFixed(4) }}
        </p>
        <div>
          <p class="font-medium text-gray-700 mb-1">Components:</p>
          <ul class="list-disc list-inside text-gray-600">
            <li>Jaccard: {{ detailedReport[selectedPair].components.jaccard.toFixed(4) }}</li>
            <li>Minhash: {{ detailedReport[selectedPair].components.minhash.toFixed(4) }}</li>
            <li>
              Transformer: {{ detailedReport[selectedPair].components.transformer.toFixed(4) }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Placeholder JSON data
const jsonData = {
  comparison_matrix: {
    'DB+OOP.pdf': {
      'DB+OOP.pdf': 100,
      'Internet+CauGiai.pdf': 33.851402282714844,
      'Nova.pdf': 13.834661483764648,
    },
    'Internet+CauGiai.pdf': {
      'DB+OOP.pdf': 33.851402282714844,
      'Internet+CauGiai.pdf': 100,
      'Nova.pdf': 10.414593696594238,
    },
    'Nova.pdf': {
      'DB+OOP.pdf': 13.834661483764648,
      'Internet+CauGiai.pdf': 10.414593696594238,
      'Nova.pdf': 100,
    },
  },
  detailed_report: {
    'DB+OOP.pdf vs Internet+CauGiai.pdf': {
      similarity_percentage: '33.85%',
      raw_score: 0.33851402282714843,
      components: {
        jaccard: 0.031746031746031744,
        minhash: 0.0546875,
        transformer: 0.7814599275588989,
      },
    },
    'DB+OOP.pdf vs Nova.pdf': {
      similarity_percentage: '13.83%',
      raw_score: 0.1383466148376465,
      components: {
        jaccard: 0,
        minhash: 0,
        transformer: 0.34586653113365173,
      },
    },
    'Internet+CauGiai.pdf vs Nova.pdf': {
      similarity_percentage: '10.41%',
      raw_score: 0.10414593696594238,
      components: {
        jaccard: 0,
        minhash: 0,
        transformer: 0.260364830493927,
      },
    },
  },
  file_categories: {
    'DB+OOP.pdf': ['cơ sở dữ liệu', 'khoa học máy tính', 'lập trình hướng đối tượng'],
    'Internet+CauGiai.pdf': ['cơ sở dữ liệu', 'khoa học máy tính', 'mạng máy tính'],
    'Nova.pdf': ['Khác'],
  },
}

// Extract data for use in template
const comparisonMatrix = ref(jsonData.comparison_matrix)
const detailedReport = ref(jsonData.detailed_report)
const fileCategories = ref(jsonData.file_categories)
const reportPairs = computed(() => Object.keys(detailedReport.value))
const fileList = computed(() => Object.keys(comparisonMatrix.value))
const selectedPair = ref('')
</script>

<style scoped>
/* Optional: Customize scrollbar for matrix table if overflowing */
table::-webkit-scrollbar {
  height: 8px;
}
table::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
</style>
