<template>
    <div class="flex-1 p-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Chat AI</h1>
      <div class="bg-white rounded-lg shadow h-[calc(100vh-12rem)] flex flex-col">
        <div class="flex-1 p-6 overflow-y-auto">
          <div class="text-gray-600">
            Tin nhắn sẽ được hiển thị tại đây.
          </div>
        </div>
        
        <div class="border-t p-4">
          <div class="relative">
            <textarea
              rows="1"
              placeholder="Nhập tin nhắn của bạn..."
              class="w-full pr-12 py-3 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            ></textarea>
            <button
              class="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700"
            >
              <Send class="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
</template>
  
<script>
  import { Send } from 'lucide-vue-next';
  
  export default {
    name: 'ChatAI',
    components: {
      Send
    }
  }
</script>