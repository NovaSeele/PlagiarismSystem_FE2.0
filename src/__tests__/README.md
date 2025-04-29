# Testing Guide for NovaSeele Plagiarism System Frontend

This directory contains test files for the frontend of the NovaSeele Plagiarism System. The tests are written using Vitest and Vue Test Utils.

## Test Structure

The tests are organized in the following structure:

- `src/components/__tests__/` - Unit tests for individual Vue components
- `src/stores/__tests__/` - Unit tests for Pinia stores
- `src/api/__tests__/` - Unit tests for API functions
- `src/__tests__/integration/` - Integration tests that test interactions between components

## Running Tests

You can run the tests using the npm scripts defined in `package.json`:

- `npm run test:unit` - Run tests in interactive mode
- `npm run test:unit:run` - Run all tests once and exit
- `npm run test:unit:coverage` - Run tests with coverage report
- `npm run test:unit:ui` - Run tests with the Vitest UI
- `npm run test:unit:watch` - Run tests in watch mode (automatically reruns tests when files change)

## Writing New Tests

### Component Tests

When writing component tests, follow these patterns:

1. Use `mount` from Vue Test Utils to render components
2. Set up required dependencies (stores, router, etc.) in the `beforeEach` hook
3. Mock child components that are not being tested
4. Test both component rendering and component behavior

Example:

```js
import { mount } from '@vue/test-utils'
import MyComponent from '../MyComponent.vue'

describe('MyComponent', () => {
  it('renders correctly', () => {
    const wrapper = mount(MyComponent)
    expect(wrapper.text()).toContain('Expected Text')
  })

  it('responds to user interaction', async () => {
    const wrapper = mount(MyComponent)
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
```

### Store Tests

When testing stores:

1. Create a fresh Pinia instance for each test
2. Mock external dependencies (API calls, localStorage, etc.)
3. Test both actions and getters

### API Tests

When testing API functions:

1. Mock the axios instance or other HTTP clients
2. Test both successful and error responses
3. Verify the correct parameters are sent

## Best Practices

1. **Isolation**: Each test should be independent of others
2. **Mocking**: Use mocks to isolate the unit being tested
3. **Coverage**: Aim for high test coverage, especially for critical components
4. **Assertions**: Make specific assertions rather than general ones
5. **Setup**: Keep test setup as simple as possible

## Troubleshooting

- If tests are failing due to DOM-related errors, make sure `jsdom` is properly set up in the Vitest configuration
- For component rendering issues, check if all required props are provided
- For store-related issues, ensure a fresh Pinia instance is created for each test

## Adding New Test Types

If you need to add a new type of test (e.g., E2E tests), follow these steps:

1. Install the required dependencies
2. Update the Vitest configuration if needed
3. Create a new directory for the tests
4. Add npm scripts to run the new tests
