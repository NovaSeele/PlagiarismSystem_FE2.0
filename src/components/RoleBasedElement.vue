<template>
  <div v-if="shouldShow">
    <slot></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '../stores/user'

const props = defineProps({
  // The role required to view this element: 'lecturer', 'student', 'guest', or 'any'
  requiredRole: {
    type: String,
    default: 'any', // By default, any authenticated user can see the element
    validator: (value) => ['lecturer', 'student', 'guest', 'any', 'authenticated'].includes(value),
  },
  // If true, the element is only shown when NOT authenticated or doesn't have the role
  inverse: {
    type: Boolean,
    default: false,
  },
})

const userStore = useUserStore()

const shouldShow = computed(() => {
  // If inverse is true, we show when the user doesn't have permission
  if (props.inverse) {
    return !hasPermission()
  }

  // Otherwise, show when the user has permission
  return hasPermission()
})

function hasPermission() {
  // Not authenticated
  if (!userStore.isAuthenticated) {
    // Only allow when requiredRole is explicitly set to 'any'
    return props.requiredRole === 'any'
  }

  // Any authenticated user is allowed
  if (props.requiredRole === 'authenticated' || props.requiredRole === 'any') {
    return true
  }

  // Lecturers can see everything
  if (userStore.isLecturer) {
    return true
  }

  // Guests can see everything except lecturer-only content
  if (userStore.isGuest) {
    return props.requiredRole !== 'lecturer'
  }

  // Students can only see elements marked for students or any
  if (userStore.isStudent) {
    return props.requiredRole === 'student' || props.requiredRole === 'guest'
  }

  // Unrecognized role - deny access
  return false
}
</script>
