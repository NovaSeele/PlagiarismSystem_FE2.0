import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { ref, computed } from 'vue'
import Header from '../Header.vue'
import { useUserStore } from '../../stores/user'
import { useNotificationStore } from '../../stores/notification'

// Mock child components
vi.mock('../NotificationDropdown.vue', () => ({
  default: {
    name: 'NotificationDropdown',
    template: '<div class="notification-dropdown-mock"></div>',
    props: ['isOpen'],
  },
}))

vi.mock('../NgrokUrlUpdater.vue', () => ({
  default: {
    name: 'NgrokUrlUpdater',
    template: '<div class="ngrok-updater-mock"></div>',
  },
}))

// Mock notification API
vi.mock('../../api/notifications', () => ({
  fetchNotifications: vi.fn().mockResolvedValue([]),
  markNotificationAsRead: vi.fn().mockResolvedValue({}),
  markAllNotificationsAsRead: vi.fn().mockResolvedValue({}),
}))

// Mock vue-router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: {} },
    { path: '/login', component: {} },
    { path: '/register', component: {} },
    { path: '/settings', component: {} },
  ],
})

// Mock Lucide icons
vi.mock('lucide-vue-next', () => ({
  User: { render: () => null },
  Bell: { render: () => null },
  Menu: { render: () => null },
  LogIn: { render: () => null },
}))

describe('Header Component', () => {
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

    // Because unreadCount is a computed property, we need to mock the notifications array instead
    vi.spyOn(notificationStore, 'getNotifications').mockResolvedValue([])

    // Spy on store methods
    vi.spyOn(userStore, 'clearUser')
  })

  it('renders correctly when user is not authenticated', async () => {
    // Ensure the user is not authenticated
    userStore.user = null

    wrapper = mount(Header, {
      global: {
        plugins: [router],
        stubs: {
          'router-link': {
            template: '<a><slot /></a>',
          },
          'router-view': true,
          component: true,
        },
      },
    })

    // Should show login and register buttons
    expect(wrapper.html()).toContain('Đăng nhập')
    expect(wrapper.html()).toContain('Đăng ký')

    // Should not show logout button
    expect(wrapper.html()).not.toContain('Đăng xuất')
  })

  it('renders correctly when user is authenticated', async () => {
    // Mock an authenticated user
    userStore.user = { full_name: 'Test User' }

    wrapper = mount(Header, {
      global: {
        plugins: [router],
        stubs: {
          'router-link': {
            template: '<a><slot /></a>',
          },
          'router-view': true,
          component: true,
        },
      },
    })

    // Should show logout button
    expect(wrapper.html()).toContain('Đăng xuất')

    // Should not show login and register buttons
    expect(wrapper.html()).not.toContain('Đăng nhập')
    expect(wrapper.html()).not.toContain('Đăng ký')
  })

  it('calls logout when logout button is clicked', async () => {
    // Mock an authenticated user
    userStore.user = { full_name: 'Test User' }

    wrapper = mount(Header, {
      global: {
        plugins: [router],
        stubs: {
          'router-link': {
            template: '<a><slot /></a>',
          },
          'router-view': true,
          component: true,
        },
      },
    })

    // Find and click the logout button using text content
    const logoutButton = wrapper.find('button:not(.notification-button):not(.btn-icon)')
    await logoutButton.trigger('click')

    // Verify that the clearUser method was called
    expect(userStore.clearUser).toHaveBeenCalled()
  })

  it('shows notification indicator when there are unread notifications', async () => {
    // Mock an authenticated user
    userStore.user = { full_name: 'Test User' }

    // Handle both notifications and unreadCount
    const mockNotifications = ref([
      { id: 1, read: false, type: 'check_complete' },
      { id: 2, read: false, type: 'document_upload' },
    ])

    // Mock the unreadCount computed property
    Object.defineProperty(notificationStore, 'notifications', {
      get: () => mockNotifications.value,
    })

    Object.defineProperty(notificationStore, 'unreadCount', {
      get: () => computed(() => mockNotifications.value.filter((n) => !n.read).length).value,
    })

    wrapper = mount(Header, {
      global: {
        plugins: [router],
        stubs: {
          'router-link': {
            template: '<a><slot /></a>',
          },
          'router-view': true,
          component: true,
        },
      },
    })

    // Check if the notification indicator is shown
    const notificationIndicator = wrapper.find('.bg-red-500')
    expect(notificationIndicator.exists()).toBe(true)
  })

  it('does not show notification indicator when there are no unread notifications', async () => {
    // Mock an authenticated user
    userStore.user = { full_name: 'Test User' }

    // All notifications are read
    const mockNotifications = ref([
      { id: 1, read: true, type: 'check_complete' },
      { id: 2, read: true, type: 'document_upload' },
    ])

    // Mock the unreadCount computed property
    Object.defineProperty(notificationStore, 'notifications', {
      get: () => mockNotifications.value,
    })

    Object.defineProperty(notificationStore, 'unreadCount', {
      get: () => computed(() => mockNotifications.value.filter((n) => !n.read).length).value,
    })

    wrapper = mount(Header, {
      global: {
        plugins: [router],
        stubs: {
          'router-link': {
            template: '<a><slot /></a>',
          },
          'router-view': true,
          component: true,
        },
      },
    })

    // Check that the notification indicator is not shown
    const notificationIndicator = wrapper.find('.bg-red-500')
    expect(notificationIndicator.exists()).toBe(false)
  })
})
