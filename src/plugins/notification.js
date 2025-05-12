import { ref, h, getCurrentInstance } from 'vue'
import NotificationSystem from '../components/NotificationSystem.vue'

export const notificationPlugin = {
  install: (app) => {
    // Create a global notification component instance
    const notificationSystemRef = ref(null)

    // Add the notification methods to the Vue instance
    app.config.globalProperties.$notify = {
      success(message, options = {}) {
        if (notificationSystemRef.value) {
          return notificationSystemRef.value.success(message, options)
        }
        console.warn('NotificationSystem not mounted yet')
      },

      error(message, options = {}) {
        if (notificationSystemRef.value) {
          return notificationSystemRef.value.error(message, options)
        }
        console.warn('NotificationSystem not mounted yet')
      },

      info(message, options = {}) {
        if (notificationSystemRef.value) {
          return notificationSystemRef.value.info(message, options)
        }
        console.warn('NotificationSystem not mounted yet')
      },

      warning(message, options = {}) {
        if (notificationSystemRef.value) {
          return notificationSystemRef.value.warning(message, options)
        }
        console.warn('NotificationSystem not mounted yet')
      },

      add(message, options = {}) {
        if (notificationSystemRef.value) {
          return notificationSystemRef.value.add(message, options)
        }
        console.warn('NotificationSystem not mounted yet')
      },

      remove(id) {
        if (notificationSystemRef.value) {
          notificationSystemRef.value.remove(id)
        }
      },
    }

    // Create a component to set the ref
    app.component('NotificationContainer', {
      setup() {
        return { notificationSystemRef }
      },
      render() {
        return h(NotificationSystem, { ref: notificationSystemRef })
      },
    })
  },
}

// Composable for use in script setup
export const useNotification = () => {
  // Get the app instance
  const instance = getCurrentInstance()

  if (!instance) {
    console.warn('useNotification must be called inside setup()')

    // Return a fallback implementation
    return {
      success: (message) => console.log('Success:', message),
      error: (message) => console.error('Error:', message),
      info: (message) => console.info('Info:', message),
      warning: (message) => console.warn('Warning:', message),
      add: (message, options) => console.log('Notification:', message, options),
      remove: (id) => {},
    }
  }

  return instance.appContext.config.globalProperties.$notify
}
