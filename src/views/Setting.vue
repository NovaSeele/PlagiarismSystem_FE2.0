<template>
  <div class="flex-1 p-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Cài đặt</h1>
    
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Thông tin cá nhân</h2>
      
      <div class="flex items-start space-x-6">
        <div class="relative group">
          <img 
            v-if="userStore.user && userStore.user.avatar"
            :src="userStore.user.avatar" 
            :alt="userStore.user.full_name"
            class="w-24 h-24 rounded-full object-cover border border-gray-200"
          />
          <div v-else class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
            <UserIcon :size="32" class="text-gray-600" />
          </div>
          
          <label 
            class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
            :class="{ 'cursor-wait': uploadingAvatar }"
          >
            <input 
              type="file" 
              accept="image/*" 
              class="hidden"
              @change="handleAvatarChange"
              :disabled="uploadingAvatar"
            />
            <Camera class="w-6 h-6 text-white" />
          </label>
        </div>
        
        <div>
          <div class="text-lg font-medium">{{ userStore.user ? userStore.user.full_name : 'User' }}</div>
          <div class="text-sm text-gray-500 mb-2">{{ userStore.user ? userStore.user.email : 'user@example.com' }}</div>
          <div v-if="userStore.user && userStore.user.msv" class="text-sm text-gray-500">
            Mã sinh viên: {{ userStore.user.msv }}
          </div>
          <div class="mt-2 text-xs text-gray-500">Hover vào ảnh đại diện để thay đổi</div>
        </div>
      </div>
    </div>
    
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Cài đặt khác</h2>
      <p class="text-gray-600">Nội dung cài đặt khác sẽ được cập nhật sau.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { User as UserIcon, Camera } from 'lucide-vue-next';
import { useUserStore } from '../stores/user';
import { uploadAvatar } from '../api/auth';

const userStore = useUserStore();
const uploadingAvatar = ref(false);

// Handle avatar change
const handleAvatarChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  uploadingAvatar.value = true;
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await uploadAvatar(formData);
    if (response.success) {
      userStore.setUser({ ...userStore.user, avatar: response.avatar_url });
    }
  } catch (error) {
    console.error('Avatar upload failed:', error);
  } finally {
    uploadingAvatar.value = false;
  }
};
</script>