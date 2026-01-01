<script setup>
import { useToast } from '../composables/useToast'

const { toasts, removeToast } = useToast()

function getIcon(type) {
  switch (type) {
    case 'success': return '✓'
    case 'error': return '✕'
    case 'warning': return '!'
    case 'info': return 'i'
    default: return 'i'
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-container" role="region" aria-label="通知">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', `toast-${toast.type}`, { 'toast-hiding': !toast.visible }]"
          role="alert"
          :aria-live="toast.type === 'error' ? 'assertive' : 'polite'"
        >
          <span class="toast-icon" aria-hidden="true">{{ getIcon(toast.type) }}</span>
          <span class="toast-message">{{ toast.message }}</span>
          <button
            class="toast-close"
            @click="removeToast(toast.id)"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 360px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
  transition: all 0.3s ease;
}

.toast-hiding {
  opacity: 0;
  transform: translateX(100%);
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 14px;
  font-weight: bold;
  color: white;
  flex-shrink: 0;
}

.toast-success .toast-icon {
  background: #4caf50;
}

.toast-error .toast-icon {
  background: #f44336;
}

.toast-warning .toast-icon {
  background: #ff9800;
}

.toast-info .toast-icon {
  background: #2196f3;
}

.toast-message {
  flex: 1;
  font-size: 14px;
  color: #333;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  transition: color 0.2s;
}

.toast-close:hover {
  color: #666;
}

/* Transition animations */
.toast-enter-active {
  animation: toast-in 0.3s ease;
}

.toast-leave-active {
  animation: toast-out 0.3s ease;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

/* Responsive */
@media (max-width: 480px) {
  .toast-container {
    left: 10px;
    right: 10px;
    max-width: none;
  }
}
</style>
