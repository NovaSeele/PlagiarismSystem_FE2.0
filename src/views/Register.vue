<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Đăng ký tài khoản</h2>
        </div>
        <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="username" class="sr-only">Tên đăng nhập</label>
              <input
                id="username"
                name="username"
                type="text"
                v-model="username"
                required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Tên đăng nhập"
              />
            </div>
            <div>
              <label for="full_name" class="sr-only">Họ và tên</label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                v-model="fullName"
                required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Họ và tên"
              />
            </div>
            <div>
              <label for="email" class="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                v-model="email"
                required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email"
              />
            </div>
            <div>
              <label for="msv" class="sr-only">Mã sinh viên</label>
              <input
                id="msv"
                name="msv"
                type="text"
                v-model="msv"
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Mã sinh viên (không bắt buộc)"
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
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Mật khẩu"
              />
            </div>
            <div>
              <label for="confirmPassword" class="sr-only">Xác nhận mật khẩu</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                v-model="confirmPassword"
                required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Xác nhận mật khẩu"
              />
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
                <User class="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
              </span>
              {{ loading ? 'Đang đăng ký...' : 'Đăng ký' }}
            </button>
          </div>
        </form>
        
        <div class="text-center">
          <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500">
            Đã có tài khoản? Đăng nhập
          </router-link>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  import { User } from 'lucide-vue-next';
  import { useRouter } from 'vue-router';
  import { register } from '../api/auth';
  
  export default {
    name: 'Register',
    components: {
      User
    },
    setup() {
      const router = useRouter();
      const username = ref('');
      const fullName = ref('');
      const email = ref('');
      const msv = ref('');
      const password = ref('');
      const confirmPassword = ref('');
      const loading = ref(false);
      const error = ref('');
  
      const handleRegister = async () => {
        try {
          if (password.value !== confirmPassword.value) {
            error.value = 'Mật khẩu xác nhận không khớp';
            return;
          }
  
          loading.value = true;
          error.value = '';
  
          const userData = {
            username: username.value,
            email: email.value,
            full_name: fullName.value,
            password: password.value,
          };
  
          if (msv.value) {
            userData.msv = msv.value;
          }
  
          await register(userData);
          router.push('/login');
        } catch (err) {
          error.value = err.message || 'Đăng ký thất bại. Vui lòng thử lại.';
        } finally {
          loading.value = false;
        }
      };
  
      return {
        username,
        fullName,
        email,
        msv,
        password,
        confirmPassword,
        loading,
        error,
        handleRegister
      };
    }
  }
  </script>