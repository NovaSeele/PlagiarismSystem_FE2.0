<template>
    <div class="flex-1 p-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Tài liệu</h1>
        <button
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Upload class="w-5 h-5 mr-2" />
          Tải lên tài liệu
        </button>
      </div>
  
      <div class="bg-white rounded-lg shadow p-6">
        <div class="mb-6">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm tài liệu..."
              class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
  
        <div class="text-gray-600">
          Danh sách tài liệu sẽ được hiển thị tại đây.
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { Search, Upload } from 'lucide-vue-next';
  
  export default {
    name: 'Documents',
    components: {
      Search,
      Upload
    }
  }
  </script>