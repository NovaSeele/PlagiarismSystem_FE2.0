// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

/**
 * Custom command to login by setting localStorage
 */
Cypress.Commands.add('loginByLocalStorage', (userData = {}) => {
  const defaultUser = {
    id: 1,
    username: 'test_user',
    full_name: 'Test User',
    email: 'test@example.com',
    ...userData,
  }

  // Set token in localStorage
  localStorage.setItem('token', 'fake-jwt-token')

  // Set user data in localStorage
  localStorage.setItem('user', JSON.stringify(defaultUser))

  // Refresh to apply the changes
  cy.reload()
})

/**
 * Custom command to logout
 */
Cypress.Commands.add('logout', () => {
  // Clear localStorage
  localStorage.removeItem('token')
  localStorage.removeItem('user')

  // Refresh to apply the changes
  cy.reload()
})

/**
 * Custom command to check for notification
 */
Cypress.Commands.add('checkNotification', (text) => {
  cy.get('.notification-area').contains(text).should('be.visible')
})

/**
 * Custom command to check if form has validation errors
 */
Cypress.Commands.add('hasValidationError', (fieldName, errorMessage) => {
  cy.get(`[data-field="${fieldName}"]`)
    .parent()
    .find('.error-message')
    .contains(errorMessage)
    .should('be.visible')
})

/**
 * Custom command to intercept and mock API results
 * Hỗ trợ cả callback function và response tĩnh
 */
Cypress.Commands.add('mockApiCall', (method, url, response, statusCode = 200) => {
  console.log(`Setting up mock for ${method} ${url}`)

  // Nếu response là function, sử dụng req.reply
  if (typeof response === 'function') {
    return cy.intercept(method, url, (req) => {
      console.log(`Intercepted ${method} ${req.url}`)
      const result = response(req)
      req.reply(result)
    })
  }
  // Nếu không, sử dụng response tĩnh
  else {
    return cy.intercept(method, url, {
      statusCode,
      body: response,
    })
  }
})
