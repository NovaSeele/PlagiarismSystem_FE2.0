<template>
  <aside
    :class="[
      'fixed left-0 top-16 h-[calc(100vh-64px)] border-r bg-white shadow-sm transition-all duration-300 ease-in-out z-30',
      isOpen ? 'w-64' : '-translate-x-full'
    ]"
  >    
    <div class="flex-1 overflow-y-auto py-4">
      <nav class="flex flex-col">
        <router-link
          to="/"
          :class="`
            flex items-center px-4 py-3 my-1 mx-2 rounded-lg transition-all duration-200
            ${$route.path === '/' ? 'bg-gray-100 text-primary font-medium' : 'text-gray-700 hover:bg-gray-50'}
          `"
        >
          <component :is="Home" :size="20" />
          <span class="ml-3">Tổng quan</span>
        </router-link>
        <router-link
          to="/documents"
          :class="`
            flex items-center px-4 py-3 my-1 mx-2 rounded-lg transition-all duration-200
            ${$route.path === '/documents' ? 'bg-gray-100 text-primary font-medium' : 'text-gray-700 hover:bg-gray-50'}
          `"
        >
          <component :is="FileText" :size="20" />
          <span class="ml-3">Tài liệu</span>
        </router-link>
        <router-link
          to="/chat-ai"
          :class="`
            flex items-center px-4 py-3 my-1 mx-2 rounded-lg transition-all duration-200
            ${$route.path === '/chat-ai' ? 'bg-gray-100 text-primary font-medium' : 'text-gray-700 hover:bg-gray-50'}
          `"
        >
          <component :is="MessageSquare" :size="20" />
          <span class="ml-3">Chat AI</span>
        </router-link>

        <router-link
          to="/plagiarism-check"
          :class="`
            flex items-center px-4 py-3 my-1 mx-2 rounded-lg transition-all duration-200
            ${$route.path === '/plagiarism-check' ? 'bg-gray-100 text-primary font-medium' : 'text-gray-700 hover:bg-gray-50'}
          `"
        >
          <component :is="BookCopy" :size="20" />
          <span class="ml-3">Kiểm tra đạo văn</span>
        </router-link>
        
        <router-link
          to="/statistics"
          :class="`
            flex items-center px-4 py-3 my-1 mx-2 rounded-lg transition-all duration-200
            ${$route.path === '/statistics' ? 'bg-gray-100 text-primary font-medium' : 'text-gray-700 hover:bg-gray-50'}
          `"
        >
          <component :is="ChartNoAxesColumnIncreasing" :size="20" />
          <span class="ml-3">Thống kê</span>
        </router-link>
        
      </nav>
      
      <div class="mt-6 pt-6 border-t mx-4">
        <div class="text-xs uppercase text-gray-500 mb-2 px-2">Utilities</div>
        <nav class="flex flex-col">
          <router-link
            to="/settings"
            :class="`
              flex items-center px-4 py-3 my-1 rounded-lg transition-all duration-200
              ${$route.path === '/settings' ? 'bg-gray-100 text-primary font-medium' : 'text-gray-700 hover:bg-gray-50'}
            `"
          >
            <component :is="Settings" :size="20" />
            <span class="ml-3">Cài đặt</span>
          </router-link>
          <router-link
            to="/help"
            :class="`
              flex items-center px-4 py-3 my-1 rounded-lg transition-all duration-200
              ${$route.path === '/help' ? 'bg-gray-100 text-primary font-medium' : 'text-gray-700 hover:bg-gray-50'}
            `"
          >
            <component :is="HelpCircle" :size="20" />
            <span class="ml-3">Help</span>
          </router-link>
        </nav>
      </div>
    </div>
    
    <div class="border-t p-4">
      <div class="text-xs text-center text-gray-500">
        <p>Design Version 1.0</p>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { 
  Home,
  MessageSquare, 
  FileText, 
  ChartNoAxesColumnIncreasing,
  BookCopy,
  Settings,
  HelpCircle
} from 'lucide-vue-next';

defineProps({
  isOpen: Boolean,
});
</script>

<style scoped>
aside {
  z-index: 40;
}
</style>