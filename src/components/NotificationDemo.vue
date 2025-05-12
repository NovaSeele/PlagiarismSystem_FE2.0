<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-xl font-bold mb-4">Hệ thống thông báo</h2>
    <p class="mb-4">
      Test thông báo:
    </p>

    <div class="flex flex-wrap gap-2 mb-6">
      <button
        @click="showSuccess"
        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        Thành công
      </button>

      <button
        @click="showError"
        class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Lỗi
      </button>

      <button
        @click="showInfo"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Thông tin
      </button>

      <button
        @click="showWarning"
        class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
      >
        Cảnh báo
      </button>
    </div>

    <div class="mt-8">
      <h3 class="text-lg font-semibold mb-2">Tùy chỉnh</h3>
      <div class="flex flex-col gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nội dung thông báo</label>
          <input
            v-model="message"
            type="text"
            class="w-full p-2 border rounded-md"
            placeholder="Nhập nội dung thông báo..."
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Thời gian hiển thị (ms)</label
          >
          <input
            v-model.number="timeout"
            type="number"
            min="100"
            step="100"
            class="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Vị trí</label>
          <select v-model="position" class="w-full p-2 border rounded-md">
            <option value="top-right">Trên bên phải</option>
            <option value="top-left">Trên bên trái</option>
            <option value="top-center">Trên giữa</option>
            <option value="bottom-right">Dưới bên phải</option>
            <option value="bottom-left">Dưới bên trái</option>
            <option value="bottom-center">Dưới giữa</option>
          </select>
        </div>

        <button
          @click="showCustom"
          class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Hiển thị thông báo tùy chỉnh
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useNotification } from '../plugins/notification'

const notify = useNotification()

// Custom notification options
const message = ref('Đây là một thông báo tùy chỉnh')
const timeout = ref(3000)
const position = ref('top-right')

function showSuccess() {
  notify.success('Thao tác đã được thực hiện thành công!')
}

function showError() {
  notify.error('Đã xảy ra lỗi, vui lòng thử lại sau!')
}

function showInfo() {
  notify.info('Đây là một thông báo thông tin.')
}

function showWarning() {
  notify.warning('Cảnh báo! Hành động này có thể gây ra hậu quả không mong muốn.')
}

function showCustom() {
  notify.add(message.value, {
    type: 'info',
    timeout: timeout.value,
    position: position.value,
  })
}
</script>
