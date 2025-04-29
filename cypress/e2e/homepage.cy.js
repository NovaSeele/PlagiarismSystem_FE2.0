describe('Homepage', () => {
  beforeEach(() => {
    // Truy cập trang chủ trước mỗi test
    cy.visit('/')
  })

  it('should display the app title', () => {
    // Kiểm tra title của trang chủ
    cy.contains('NovaSeele Plagiarism Check').should('be.visible')
  })

  it('should show login and register buttons when not logged in', () => {
    // Kiểm tra hiển thị nút đăng nhập và đăng ký khi chưa đăng nhập
    cy.contains('Đăng nhập').should('be.visible')
    cy.contains('Đăng ký').should('be.visible')
  })

  it('should navigate to login page when login button is clicked', () => {
    // Kiểm tra chuyển hướng đến trang đăng nhập khi nhấn nút đăng nhập
    cy.contains('Đăng nhập').click()
    cy.url().should('include', '/login')
  })

  it('should navigate to register page when register button is clicked', () => {
    // Kiểm tra chuyển hướng đến trang đăng ký khi nhấn nút đăng ký
    cy.contains('Đăng ký').click()
    cy.url().should('include', '/register')
  })
})
