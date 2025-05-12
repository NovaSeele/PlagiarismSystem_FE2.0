<template>
  <div>
    <TransitionGroup name="notification">
      <div
        v-for="item in notifications"
        :key="item.id"
        class="fixed max-w-md p-4 rounded-lg shadow-lg z-50"
        :class="[
          item.position ? positionClasses[item.position] : 'top-4 right-4',
          {
            'bg-green-50 text-green-800 border border-green-200': item.type === 'success',
            'bg-red-50 text-red-800 border border-red-200': item.type === 'error',
            'bg-blue-50 text-blue-800 border border-blue-200': item.type === 'info',
            'bg-yellow-50 text-yellow-800 border border-yellow-200': item.type === 'warning',
          },
        ]"
      >
        <div class="flex items-center">
          <div v-if="item.type === 'success'" class="mr-2">
            <!-- Success icon -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div v-else-if="item.type === 'error'" class="mr-2">
            <!-- Error icon -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div v-else-if="item.type === 'warning'" class="mr-2">
            <!-- Warning icon -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div v-else class="mr-2">
            <!-- Info icon -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h.01a1 1 0 000-2H9z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="flex-1">
            <p>{{ item.message }}</p>
          </div>
          <button @click="remove(item.id)" class="ml-2 text-gray-500 hover:text-gray-700">
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
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Positions
const positionClasses = {
  'top-left': 'top-4 left-4',
  'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4',
}

// Store all notifications
const notifications = ref([])

// Add a new notification
function add(message, options = {}) {
  const id = Date.now()
  const notification = {
    id,
    message,
    type: options.type || 'info',
    position: options.position || 'top-right',
    timeout: options.timeout !== undefined ? options.timeout : 3000,
  }

  notifications.value.push(notification)

  // Auto remove after timeout (if not 0)
  if (notification.timeout > 0) {
    setTimeout(() => {
      remove(id)
    }, notification.timeout)
  }

  return id
}

// Remove a notification by id
function remove(id) {
  const index = notifications.value.findIndex((n) => n.id === id)
  if (index !== -1) {
    notifications.value.splice(index, 1)
  }
}

// Helper methods for common notification types
function success(message, options = {}) {
  return add(message, { ...options, type: 'success' })
}

function error(message, options = {}) {
  return add(message, { ...options, type: 'error' })
}

function info(message, options = {}) {
  return add(message, { ...options, type: 'info' })
}

function warning(message, options = {}) {
  return add(message, { ...options, type: 'warning' })
}

// Expose methods
defineExpose({
  add,
  remove,
  success,
  error,
  info,
  warning,
})
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateY(-30px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
