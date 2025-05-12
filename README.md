# Frontend - Giao diện của hệ thống kiểm tra đạo văn chéo

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
cd {folder}
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run format
npm run dev
```

### Compile and Minify for Production

```sh
npm run format
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
unit test cập nhật sau
```

## Custom Notification System

This project uses a custom notification system that replaces vue-toastification due to compatibility issues with Vue 3.5.x. Vue-toastification is designed for Vue 2.x and causes dependency conflicts.

### Features of the Custom Notification System

- Fully compatible with Vue 3.x
- Multiple notification types: success, error, info, warning
- Customizable position, timeout, and content
- Custom styling using Tailwind CSS
- Animation transitions
- Programmatic dismissal

### Usage

#### Basic Usage

```js
// In your component
import { useNotification } from '../plugins/notification'

const notify = useNotification()

// Different notification types
notify.success('Operation successful!')
notify.error('An error occurred!')
notify.info('This is an information message')
notify.warning('Warning: This action has consequences')
```

#### Custom Options

```js
notify.add('Custom notification', {
  type: 'info', // 'success', 'error', 'info', 'warning'
  timeout: 5000, // milliseconds, set to 0 for no auto-dismiss
  position: 'top-right', // 'top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'
})
```

### Demo

A demonstration component is available at:

- Route: `/notification-demo`
- Component: `src/components/NotificationDemo.vue`

### System Components

1. **NotificationSystem.vue**: The core component that manages and displays notifications
2. **notification.js**: Plugin that integrates with Vue and provides a composable
3. **useNotification**: Composable function for use in `<script setup>` components

### Setup

The notification system is globally available throughout the app. It is initialized in:

- `src/main.js` - Plugin registration
- `src/App.vue` - Global notification container

No additional setup is required to use the notification system in your components.
