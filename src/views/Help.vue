<template>
  <div class="flex-1 p-6 max-w-5xl mx-auto">
    <div class="bg-white rounded-lg shadow-md p-6 mb-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Hướng dẫn sử dụng hệ thống</h1>
      <p class="text-gray-600 mb-6">
        Chào mừng bạn đến với hệ thống kiểm tra đạo văn NovaSeele. Hướng dẫn này sẽ giúp bạn tìm
        hiểu cách sử dụng các tính năng của hệ thống.
      </p>

      <!-- Accordion sections -->
      <div class="space-y-4">
        <!-- Section 1: Overview -->
        <div class="border rounded-lg overflow-hidden">
          <button
            @click="toggleSection('overview')"
            class="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-center">
              <div class="bg-blue-100 p-2 rounded-full mr-3">
                <Home class="w-5 h-5 text-blue-600" />
              </div>
              <span class="font-medium text-gray-800">Tổng quan hệ thống</span>
            </div>
            <ChevronDown
              class="w-5 h-5 text-gray-500 transition-transform duration-200"
              :class="{ 'transform rotate-180': openSections.overview }"
            />
          </button>
          <div
            v-show="openSections.overview"
            class="p-4 bg-white border-t text-gray-700 text-sm leading-relaxed"
          >
            <p class="mb-3">
              Hệ thống kiểm tra đạo văn NovaSeele được thiết kế để phát hiện sự trùng lặp giữa các
              tài liệu PDF. Hệ thống sử dụng nhiều thuật toán khác nhau để đảm bảo độ chính xác cao:
            </p>
            <ul class="list-disc pl-5 mb-3 space-y-2">
              <li>
                <b>BERT (Bidirectional Encoder Representations from Transformers)</b>: Mô hình ngôn
                ngữ tiên tiến giúp hiểu ngữ cảnh và ý nghĩa của văn bản.
              </li>
              <li>
                <b>FastText</b>: Thuật toán nhúng từ được tối ưu hóa cho hiệu suất, cho phép so sánh
                ngữ nghĩa nhanh chóng.
              </li>
              <li>
                <b>LSA (Latent Semantic Analysis)</b>: Phương pháp phân tích ngữ nghĩa tiềm ẩn giúp
                phát hiện các mối quan hệ ngữ nghĩa giữa các tài liệu.
              </li>
            </ul>
            <p>
              Quá trình kiểm tra đạo văn được thực hiện theo từng lớp, kết hợp kết quả từ các thuật
              toán khác nhau để đưa ra kết luận cuối cùng về việc hai tài liệu có đạo văn hay không.
            </p>
          </div>
        </div>

        <!-- Section 2: Documents -->
        <div class="border rounded-lg overflow-hidden">
          <button
            @click="toggleSection('documents')"
            class="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-center">
              <div class="bg-indigo-100 p-2 rounded-full mr-3">
                <FileText class="w-5 h-5 text-indigo-600" />
              </div>
              <span class="font-medium text-gray-800">Quản lý tài liệu</span>
            </div>
            <ChevronDown
              class="w-5 h-5 text-gray-500 transition-transform duration-200"
              :class="{ 'transform rotate-180': openSections.documents }"
            />
          </button>
          <div
            v-show="openSections.documents"
            class="p-4 bg-white border-t text-gray-700 text-sm leading-relaxed"
          >
            <h3 class="font-semibold mb-2">Tải lên tài liệu</h3>
            <p class="mb-3">
              Để tải lên tài liệu mới, hãy truy cập trang <b>Tài liệu</b> và nhấp vào nút "Tải lên
              tài liệu". Hệ thống hỗ trợ tải lên các tệp PDF.
            </p>

            <h3 class="font-semibold mb-2">Xem và tìm kiếm tài liệu</h3>
            <p class="mb-3">
              Trang <b>Tài liệu</b> hiển thị tất cả các tài liệu đã được tải lên. Bạn có thể:
            </p>
            <ul class="list-disc pl-5 mb-3 space-y-2">
              <li>Sử dụng thanh tìm kiếm để lọc tài liệu theo tên hoặc nội dung</li>
              <li>Nhấp vào tài liệu để xem chi tiết</li>
              <li>
                Chọn nhiều tài liệu (sử dụng các hộp kiểm) để thêm vào hàng đợi kiểm tra đạo văn
              </li>
            </ul>

            <div class="bg-blue-50 p-3 rounded-lg mb-3">
              <div class="flex items-start">
                <div class="bg-blue-100 p-1 rounded-full mr-2">
                  <InfoIcon class="w-4 h-4 text-blue-600" />
                </div>
                <p class="text-blue-800 text-xs">
                  <b>Mẹo:</b> Khi chọn nhiều tài liệu, nút "Thêm vào kiểm tra đạo văn" sẽ xuất hiện
                  ở trên cùng của trang.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 3: Plagiarism Check -->
        <div class="border rounded-lg overflow-hidden">
          <button
            @click="toggleSection('check')"
            class="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-center">
              <div class="bg-green-100 p-2 rounded-full mr-3">
                <BookCopy class="w-5 h-5 text-green-600" />
              </div>
              <span class="font-medium text-gray-800">Kiểm tra đạo văn</span>
            </div>
            <ChevronDown
              class="w-5 h-5 text-gray-500 transition-transform duration-200"
              :class="{ 'transform rotate-180': openSections.check }"
            />
          </button>
          <div
            v-show="openSections.check"
            class="p-4 bg-white border-t text-gray-700 text-sm leading-relaxed"
          >
            <h3 class="font-semibold mb-2">Cách thức kiểm tra</h3>
            <p class="mb-3">Hệ thống cung cấp hai phương thức kiểm tra đạo văn:</p>

            <h4 class="font-medium text-gray-800 mb-1">1. Kiểm tra tài liệu đã chọn</h4>
            <p class="mb-3">
              Phương pháp này cho phép bạn kiểm tra một tập hợp cụ thể các tài liệu. Để sử dụng:
            </p>
            <ul class="list-disc pl-5 mb-4 space-y-2">
              <li>Chọn các tài liệu từ trang <b>Tài liệu</b> và thêm vào hàng đợi</li>
              <li>
                Truy cập trang <b>Kiểm tra đạo văn</b>, nơi các tài liệu đã chọn sẽ được hiển thị
              </li>
              <li>Nhấp vào nút "Kiểm tra tài liệu đã chọn" để bắt đầu quá trình kiểm tra</li>
            </ul>

            <h4 class="font-medium text-gray-800 mb-1">2. Kiểm tra toàn bộ cơ sở dữ liệu</h4>
            <p class="mb-3">
              Phương pháp này kiểm tra tất cả các tài liệu trong hệ thống. Để sử dụng:
            </p>
            <ul class="list-disc pl-5 mb-3 space-y-2">
              <li>Truy cập trang <b>Kiểm tra đạo văn</b></li>
              <li>
                Nhấp vào nút "Kiểm tra toàn bộ tài liệu" trong phần "Kiểm tra toàn bộ cơ sở dữ liệu"
              </li>
            </ul>

            <div class="bg-yellow-50 p-3 rounded-lg">
              <div class="flex items-start">
                <div class="bg-yellow-100 p-1 rounded-full mr-2">
                  <AlertTriangle class="w-4 h-4 text-yellow-600" />
                </div>
                <p class="text-yellow-800 text-xs">
                  <b>Lưu ý:</b> Quá trình kiểm tra có thể mất thời gian tùy thuộc vào số lượng và độ
                  dài của các tài liệu. Vui lòng kiên nhẫn trong quá trình xử lý.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 4: View Results -->
        <div class="border rounded-lg overflow-hidden">
          <button
            @click="toggleSection('results')"
            class="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-center">
              <div class="bg-purple-100 p-2 rounded-full mr-3">
                <MessageSquare class="w-5 h-5 text-purple-600" />
              </div>
              <span class="font-medium text-gray-800">Xem kết quả</span>
            </div>
            <ChevronDown
              class="w-5 h-5 text-gray-500 transition-transform duration-200"
              :class="{ 'transform rotate-180': openSections.results }"
            />
          </button>
          <div
            v-show="openSections.results"
            class="p-4 bg-white border-t text-gray-700 text-sm leading-relaxed"
          >
            <h3 class="font-semibold mb-2">Hiểu kết quả kiểm tra</h3>
            <p class="mb-3">
              Sau khi hoàn thành quá trình kiểm tra, bạn sẽ được chuyển hướng đến trang
              <b>Xem kết quả</b> để xem chi tiết. Các thông tin quan trọng bao gồm:
            </p>

            <h4 class="font-medium text-gray-800 mb-1">Thông tin tổng quan</h4>
            <ul class="list-disc pl-5 mb-3 space-y-2">
              <li>Số lượng tài liệu được kiểm tra</li>
              <li>Thời gian thực hiện</li>
              <li>Tổng số cặp so sánh</li>
              <li>Số lượng trùng lặp được phát hiện</li>
            </ul>

            <h4 class="font-medium text-gray-800 mb-1">Chế độ xem kết quả</h4>
            <p class="mb-2">Có hai chế độ xem kết quả:</p>
            <ul class="list-disc pl-5 mb-3 space-y-2">
              <li>
                <b>Cặp so sánh:</b> Hiển thị từng cặp tài liệu đã được so sánh cùng với điểm số
                tương đồng
              </li>
              <li>
                <b>Tài liệu:</b> Nhóm kết quả theo từng tài liệu, cho phép bạn xem tài liệu nào có
                nhiều trùng lặp nhất
              </li>
            </ul>

            <h4 class="font-medium text-gray-800 mb-1">Điểm tương đồng</h4>
            <p class="mb-2">Mỗi cặp tài liệu được đánh giá dựa trên ba thuật toán:</p>
            <ul class="list-disc pl-5 mb-3 space-y-1">
              <li><b>BERT:</b> Đánh giá ngữ nghĩa sâu với ngữ cảnh</li>
              <li><b>FastText (FT):</b> So sánh dựa trên vector từ</li>
              <li><b>LSA:</b> Phân tích ngữ nghĩa tiềm ẩn</li>
            </ul>

            <h4 class="font-medium text-gray-800 mb-1">Xem chi tiết cặp tài liệu</h4>
            <p class="mb-3">
              Nhấp vào bất kỳ cặp tài liệu nào để xem phân tích chi tiết về sự trùng lặp, bao gồm
              các đoạn văn bản cụ thể có khả năng bị đạo văn.
            </p>

            <div class="bg-blue-50 p-3 rounded-lg">
              <div class="flex items-start">
                <div class="bg-blue-100 p-1 rounded-full mr-2">
                  <InfoIcon class="w-4 h-4 text-blue-600" />
                </div>
                <p class="text-blue-800 text-xs">
                  <b>Mẹo:</b> Sử dụng các bộ lọc và tùy chọn sắp xếp để tìm nhanh các trùng lặp quan
                  trọng nhất. Có thể lọc theo "Chỉ trùng lặp" để xem các cặp tài liệu bị xác định là
                  đạo văn.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 5: Statistics -->
        <div class="border rounded-lg overflow-hidden">
          <button
            @click="toggleSection('statistics')"
            class="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-center">
              <div class="bg-teal-100 p-2 rounded-full mr-3">
                <ChartNoAxesColumnIncreasing class="w-5 h-5 text-teal-600" />
              </div>
              <span class="font-medium text-gray-800">Thống kê</span>
            </div>
            <ChevronDown
              class="w-5 h-5 text-gray-500 transition-transform duration-200"
              :class="{ 'transform rotate-180': openSections.statistics }"
            />
          </button>
          <div
            v-show="openSections.statistics"
            class="p-4 bg-white border-t text-gray-700 text-sm leading-relaxed"
          >
            <p class="mb-3">
              Trang <b>Thống kê</b> cung cấp các biểu đồ và thông tin tổng hợp về các tài liệu trong
              hệ thống và kết quả kiểm tra đạo văn qua thời gian. Các chỉ số quan trọng bao gồm:
            </p>
            <ul class="list-disc pl-5 mb-3 space-y-2">
              <li>Tỷ lệ đạo văn theo thời gian</li>
              <li>Phân bố điểm tương đồng giữa các tài liệu</li>
              <li>Tài liệu có tỷ lệ trùng lặp cao nhất</li>
              <li>Hiệu suất của từng thuật toán phát hiện đạo văn</li>
            </ul>
            <p>
              Sử dụng thông tin này để hiểu xu hướng và mức độ đạo văn trong bộ sưu tập tài liệu của
              bạn.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- FAQ Section -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-bold text-gray-900 mb-6">Câu hỏi thường gặp (FAQ)</h2>

      <div class="space-y-4">
        <div
          v-for="(faq, index) in faqs"
          :key="index"
          class="border-b pb-4 last:border-b-0 last:pb-0"
        >
          <button
            @click="faq.open = !faq.open"
            class="w-full flex items-start justify-between text-left"
          >
            <h3 class="font-medium text-gray-800">{{ faq.question }}</h3>
            <ChevronDown
              class="w-5 h-5 text-gray-500 transition-transform duration-200 mt-1 flex-shrink-0"
              :class="{ 'transform rotate-180': faq.open }"
            />
          </button>
          <div v-show="faq.open" class="mt-2 text-gray-600 text-sm">
            <p>{{ faq.answer }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  Home,
  ChevronDown,
  FileText,
  BookCopy,
  MessageSquare,
  ChartNoAxesColumnIncreasing,
  Info as InfoIcon,
  AlertTriangle,
} from 'lucide-vue-next'

// Section open states
const openSections = ref({
  overview: true,
  documents: false,
  check: false,
  results: false,
  statistics: false,
})

// Toggle section visibility
const toggleSection = (section) => {
  openSections.value[section] = !openSections.value[section]
}

// FAQ items
const faqs = ref([
  {
    question: 'Hệ thống hỗ trợ những định dạng tài liệu nào?',
    answer:
      'Hiện tại, hệ thống chỉ hỗ trợ tải lên và kiểm tra tài liệu có định dạng PDF. Các định dạng khác như DOCX, TXT có thể được hỗ trợ trong các phiên bản tương lai.',
    open: false,
  },
  {
    question: 'Mức độ trùng lặp như thế nào được coi là đạo văn?',
    answer:
      'Hệ thống sử dụng nhiều thuật toán và ngưỡng kết hợp để xác định đạo văn. Thông thường, mức độ trùng lặp trên 70% theo thuật toán BERT, cùng với điểm cao từ các thuật toán khác, sẽ được đánh dấu là đạo văn. Tuy nhiên, người dùng nên đánh giá kết quả dựa trên ngữ cảnh cụ thể.',
    open: false,
  },
  {
    question: 'Hệ thống có thể phát hiện đạo văn bằng nhiều ngôn ngữ khác nhau không?',
    answer:
      'Hệ thống được tối ưu hóa để phát hiện đạo văn trong tiếng Việt. Nó cũng có khả năng phát hiện đạo văn trong tiếng Anh, nhưng hiệu suất có thể thấp hơn so với tiếng Việt. Hỗ trợ cho các ngôn ngữ khác đang được phát triển.',
    open: false,
  },
  {
    question: 'Dữ liệu của tôi có được bảo mật không?',
    answer:
      'Có, bảo mật là ưu tiên hàng đầu của chúng tôi. Tất cả dữ liệu được mã hóa trong quá trình truyền tải và lưu trữ. Chỉ người dùng được ủy quyền mới có thể truy cập và xem tài liệu của bạn.',
    open: false,
  },
  {
    question: 'Tôi có thể xuất kết quả kiểm tra đạo văn không?',
    answer:
      'Tính năng xuất kết quả sẽ sớm được thêm vào hệ thống. Bạn sẽ có thể xuất báo cáo chi tiết dưới dạng PDF hoặc CSV để phân tích ngoại tuyến hoặc chia sẻ với những người khác.',
    open: false,
  },
])
</script>
