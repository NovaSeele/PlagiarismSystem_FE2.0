describe('Login', () => {
  beforeEach(() => {
    // Tạo alias cho route API để theo dõi
    cy.intercept('POST', '**/token').as('loginRequest')
    cy.intercept('GET', '**/users/me').as('getUserRequest')

    // Truy cập trang đăng nhập trước mỗi test
    cy.visit('/login')
  })

  it('should display login form', () => {
    cy.get('form').should('be.visible')
    cy.get('input[type="text"]').should('be.visible') // Username/email field
    cy.get('input[type="password"]').should('be.visible') // Password field
    cy.contains('button', 'Đăng nhập').should('be.visible')
  })

  it('should show validation errors for empty fields', () => {
    // Submit form without entering data
    cy.contains('button', 'Đăng nhập').click()

    // Check if validation errors appear
    cy.contains('Tên đăng nhập là bắt buộc').should('be.visible')
    cy.contains('Mật khẩu là bắt buộc').should('be.visible')
  })

  it('should show error message for invalid credentials', () => {
    // Enter invalid credentials
    cy.get('input[type="text"]').type('invalid_user')
    cy.get('input[type="password"]').type('wrong_password')
    cy.contains('button', 'Đăng nhập').click()

    // Wait for the API call to complete
    cy.wait('@loginRequest')

    // Check if error message appears
    cy.contains('Tên đăng nhập hoặc mật khẩu không đúng').should('be.visible')
  })

  it('should redirect to homepage after successful login', () => {
    // Nhập thông tin đăng nhập đúng
    cy.get('input[type="text"]').type('SeeleSeele')
    cy.get('input[type="password"]').type('seeleseele')

    // Click đăng nhập
    cy.contains('button', 'Đăng nhập').click()

    // Đợi API đăng nhập và get user hoàn thành
    cy.wait('@loginRequest').then((interception) => {
      // Đảm bảo trạng thái 200
      expect(interception.response.statusCode).to.equal(200)
    })

    // Chờ redirect đến homepage
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })
})
