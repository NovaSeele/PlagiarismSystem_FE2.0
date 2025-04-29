# E2E Testing với Cypress cho NovaSeele Plagiarism System

E2E (End-to-End) testing cho frontend NovaSeele Plagiarism System được thực hiện bằng Cypress. Tài liệu này hướng dẫn cách chạy và mở rộng các test E2E.

## Cấu trúc thư mục

```
cypress/
├── e2e/                   # Chứa tất cả các test E2E
│   ├── homepage.cy.js     # Test cho trang chủ
│   ├── login.cy.js        # Test cho trang đăng nhập
│   ├── plagiarism-check.cy.js  # Test cho chức năng kiểm tra đạo văn
│   └── view-results.cy.js # Test cho trang xem kết quả
├── fixtures/              # Chứa dữ liệu test
├── support/               # Chứa các hàm hỗ trợ và custom commands
│   ├── commands.js        # Định nghĩa các lệnh tùy chỉnh
│   ├── index.d.ts         # Type definitions cho TypeScript
│   └── e2e.js             # File cấu hình cho Cypress
└── README.md              # Tài liệu này
```

## Cài đặt

Dự án đã được cấu hình với Cypress. Để cài đặt, chỉ cần chạy:

```bash
npm install
```

## Chạy tests

### Mở Cypress GUI

```bash
npm run test:e2e
```

Lệnh này sẽ mở giao diện Cypress, nơi bạn có thể chọn các test cụ thể để chạy.

### Chạy tất cả tests

```bash
npm run test:e2e:run
```

Lệnh này sẽ chạy tất cả các test trong chế độ headless (không có giao diện).

## Custom Commands

Dự án có một số lệnh tùy chỉnh để đơn giản hóa việc viết tests:

### `cy.loginByLocalStorage(userData)`

Đăng nhập bằng cách thiết lập token và dữ liệu người dùng trong localStorage.

```javascript
// Đăng nhập với dữ liệu người dùng mặc định
cy.loginByLocalStorage()

// Đăng nhập với dữ liệu tùy chỉnh
cy.loginByLocalStorage({ id: 2, username: 'custom_user' })
```

### `cy.logout()`

Đăng xuất bằng cách xóa token và dữ liệu người dùng khỏi localStorage.

```javascript
cy.logout()
```

### `cy.checkNotification(text)`

Kiểm tra xem có thông báo hiển thị với văn bản cụ thể không.

```javascript
cy.checkNotification('Đăng nhập thành công')
```

### `cy.hasValidationError(fieldName, errorMessage)`

Kiểm tra xem trường có hiển thị lỗi xác thực không.

```javascript
cy.hasValidationError('username', 'Tên đăng nhập là bắt buộc')
```

### `cy.mockApiCall(method, url, response, statusCode)`

Mock response API để test mà không cần backend thật.

```javascript
cy.mockApiCall('GET', '/api/users', [{ id: 1, name: 'Test User' }])
```

## Viết tests mới

Để tạo test mới:

1. Tạo file mới trong thư mục `cypress/e2e/` với phần mở rộng `.cy.js`
2. Sử dụng cấu trúc tương tự như các test hiện có

Ví dụ:

```javascript
describe('My New Feature', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.loginByLocalStorage()
  })

  it('should do something specific', () => {
    // test logic here
  })
})
```

## Best Practices

1. **Tính độc lập**: Mỗi test nên độc lập và không phụ thuộc vào kết quả của các test khác.
2. **Sử dụng custom commands**: Tận dụng các lệnh tùy chỉnh để giảm thiểu mã lặp lại.
3. **Mock API calls**: Sử dụng `cy.mockApiCall()` để kiểm soát phản hồi API và tránh phụ thuộc vào backend thật.
4. **Chọn elements thông minh**: Sử dụng data attributes (như `data-testid`) thay vì CSS selectors để tests ít bị ảnh hưởng bởi thay đổi styling.

## Troubleshooting

1. **Tests không ổn định**: Nếu tests thất bại không nhất quán, hãy thêm `cy.wait()` hoặc kiểm tra element tồn tại trước khi tương tác.
2. **Lỗi khi chạy tests headless**: Đảm bảo rằng tất cả các tương tác trực quan (hover, drag-drop) hoạt động tốt trong chế độ headless.
3. **Cypress không tìm thấy elements**: Thử sử dụng `cy.debug()` hoặc `cy.screenshot()` để gỡ lỗi.
