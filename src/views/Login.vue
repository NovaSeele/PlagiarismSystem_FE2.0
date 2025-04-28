<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Đăng nhập</h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">Email hoặc tên đăng nhập</label>
            <input
              id="email"
              name="email"
              type="text"
              v-model="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Email hoặc tên đăng nhập"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Mật khẩu</label>
            <input
              id="password"
              name="password"
              type="password"
              v-model="password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Mật khẩu"
            />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              v-model="rememberMe"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-900">
              Ghi nhớ đăng nhập
            </label>
          </div>
        </div>

        <div v-if="error" class="text-red-500 text-sm text-center">
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <LogIn class="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
            </span>
            {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
          </button>
        </div>
      </form>

      <div class="text-center">
        <router-link to="/register" class="font-medium text-blue-600 hover:text-blue-500">
          Chưa có tài khoản? Đăng ký ngay
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { LogIn } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { login } from '../api/auth'
import { useUserStore } from '../stores/user'

export default {
  name: 'Login',
  components: {
    LogIn,
  },
  setup() {
    const router = useRouter()
    const userStore = useUserStore()

    const email = ref('')
    const password = ref('')
    const rememberMe = ref(false)
    const loading = ref(false)
    const error = ref('')

    const handleLogin = async () => {
      try {
        loading.value = true
        error.value = ''

        const token = await login(email.value, password.value)
        if (!token) {
          throw new Error('Login failed. No token received.')
        }

        localStorage.setItem('token', token)
        await userStore.fetchUser()

        // Save user data to localStorage for persistence
        if (userStore.user) {
          userStore.saveToLocalStorage()
        }

        router.push('/')
      } catch (err) {
        error.value = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.'
        console.error('Login error:', err)
      } finally {
        loading.value = false
      }
    }

    return {
      email,
      password,
      rememberMe,
      loading,
      error,
      handleLogin,
    }
  },
}
</script>
