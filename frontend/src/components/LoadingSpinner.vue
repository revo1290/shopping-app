<script setup>
defineProps({
  size: {
    type: String,
    default: 'medium',
    validator: (v) => ['small', 'medium', 'large'].includes(v)
  },
  color: {
    type: String,
    default: 'primary'
  }
})
</script>

<template>
  <span :class="['spinner', `spinner-${size}`]"></span>
</template>

<style scoped>
.spinner {
  display: inline-block;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner-small {
  width: 14px;
  height: 14px;
  border-width: 2px;
}

.spinner-medium {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

.spinner-large {
  width: 32px;
  height: 32px;
  border-width: 3px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
