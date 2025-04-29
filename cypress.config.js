import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 120000, // 2 minutes in milliseconds
    requestTimeout: 120000, // 2 minutes in milliseconds
    responseTimeout: 120000, // 2 minutes in milliseconds
    // Cho phép timeout dài để các API AI có thể hoàn thành
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },

  component: {
    devServer: {
      framework: 'vue',
      bundler: 'vite',
    },
  },
})
