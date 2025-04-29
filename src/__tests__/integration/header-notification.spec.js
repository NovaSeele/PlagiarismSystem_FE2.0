import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import Header from '../../components/Header.vue'
import NotificationDropdown from '../../components/NotificationDropdown.vue'
import { useUserStore } from '../../stores/user'
import { useNotificationStore } from '../../stores/notification'

// Skip mocking NotificationDropdown for integration test
vi.mock('../../components/NgrokUrlUpdater.vue', () => ({
  default: {
    name: 'NgrokUrlUpdater',
    template: '<div class="ngrok-updater-mock"></div>',
  },
}))

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: {} },
    { path: '/login', component: {} },
    { path: '/register', component: {} },
    { path: '/settings', component: {} },
    { path: '/view-results', component: {} },
    { path: '/plagiarism-check', component: {} },
    { path: '/documents', component: {} },
  ],
})

// Mock router.push to track navigation
vi.spyOn(router, 'push')

describe('Header and Notification Integration', () => {
  let wrapper
  let userStore
  let notificationStore

  beforeEach(() => {
    // Create a fresh Pinia instance for each test
    const pinia = createPinia()
    setActivePinia(pinia)

    // Get the store instances
    userStore = useUserStore()
    notificationStore = useNotificationStore()

    // Mock store methods
    vi.spyOn(notificationStore, 'getNotifications').mockResolvedValue([])

    // Setup mock notification types for the tests
    notificationStore.NOTIFICATION_TYPES = {
      CHECK_COMPLETE: 'check_complete',
      CHECK_START: 'check_start',
      QUEUE_ADD: 'queue_add',
      DOCUMENT_UPLOAD: 'document_upload',
    }

    // Mock authenticated user
    userStore.user = { id: 1, full_name: 'Test User' }
  })

  it('opens the notification dropdown when bell icon is clicked', async () => {
    // Mount the Header component for this test
    wrapper = mount(Header, {
      global: {
        plugins: [router],
        stubs: {
          'router-link': true,
          'router-view': true,
          // Do NOT stub NotificationDropdown component for integration test
          NotificationDropdown: false,
        },
      },
    })

    // Find and click the bell icon button
    const bellButton = wrapper.find('.notification-button')
    await bellButton.trigger('click')

    // Verify dropdown is opened
    const dropdown = wrapper.findComponent(NotificationDropdown)
    expect(dropdown.props('isOpen')).toBe(true)
  })

  it('navigates to the correct page when a notification is clicked', async () => {
    // Mount the header with the actual NotificationDropdown component
    wrapper = mount(Header, {
      global: {
        plugins: [router],
        stubs: {
          'router-link': true,
          'router-view': true,
        },
      },
    })

    // Open the notification dropdown
    const bellButton = wrapper.find('.notification-button')
    await bellButton.trigger('click')

    // Now simulate a notification click by directly calling the handler
    // with different notification types

    // Case 1: CHECK_COMPLETE notification
    const checkCompleteNotification = {
      type: notificationStore.NOTIFICATION_TYPES.CHECK_COMPLETE,
    }

    // Get the handleNotificationClick method from the component instance
    const headerComponent = wrapper.vm

    // Call the method manually as if a notification was clicked
    headerComponent.handleNotificationClick(checkCompleteNotification)

    // Verify router was called with correct path
    expect(router.push).toHaveBeenCalledWith('/view-results')

    // Reset the mock
    vi.clearAllMocks()

    // Case 2: CHECK_START notification
    const checkStartNotification = {
      type: notificationStore.NOTIFICATION_TYPES.CHECK_START,
    }
    headerComponent.handleNotificationClick(checkStartNotification)
    expect(router.push).toHaveBeenCalledWith('/plagiarism-check')

    // Reset the mock
    vi.clearAllMocks()

    // Case 3: QUEUE_ADD notification
    const queueAddNotification = {
      type: notificationStore.NOTIFICATION_TYPES.QUEUE_ADD,
    }
    headerComponent.handleNotificationClick(queueAddNotification)
    expect(router.push).toHaveBeenCalledWith('/plagiarism-check')

    // Reset the mock
    vi.clearAllMocks()

    // Case 4: DOCUMENT_UPLOAD notification
    const documentUploadNotification = {
      type: notificationStore.NOTIFICATION_TYPES.DOCUMENT_UPLOAD,
    }
    headerComponent.handleNotificationClick(documentUploadNotification)
    expect(router.push).toHaveBeenCalledWith('/documents')
  })

  it('fetches notifications on mount when user is authenticated', async () => {
    // Mount the component
    wrapper = mount(Header, {
      global: {
        plugins: [router],
        stubs: {
          'router-link': true,
          'router-view': true,
          NotificationDropdown: true,
        },
      },
    })

    // Verify getNotifications was called
    expect(notificationStore.getNotifications).toHaveBeenCalled()
  })

  it('does not fetch notifications when user is not authenticated', async () => {
    // Set user to null (not authenticated)
    userStore.user = null

    // Mount the component
    wrapper = mount(Header, {
      global: {
        plugins: [router],
        stubs: {
          'router-link': true,
          'router-view': true,
          NotificationDropdown: true,
        },
      },
    })

    // Verify getNotifications was not called
    expect(notificationStore.getNotifications).not.toHaveBeenCalled()
  })
})
