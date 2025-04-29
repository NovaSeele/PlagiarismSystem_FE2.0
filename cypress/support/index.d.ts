/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    /**
     * Custom command to login by setting localStorage
     * @example cy.loginByLocalStorage()
     */
    loginByLocalStorage(userData?: object): Chainable<any>

    /**
     * Custom command to logout
     * @example cy.logout()
     */
    logout(): Chainable<any>

    /**
     * Custom command to check for notification
     * @example cy.checkNotification('Success')
     */
    checkNotification(text: string): Chainable<any>

    /**
     * Custom command to check if form has validation errors
     * @example cy.hasValidationError('username', 'Username is required')
     */
    hasValidationError(fieldName: string, errorMessage: string): Chainable<any>

    /**
     * Custom command to intercept and mock API results
     * @example cy.mockApiCall('GET', '/api/users', [{id: 1, name: 'User'}])
     */
    mockApiCall(method: string, url: string, response: any, statusCode?: number): Chainable<any>
  }
}
