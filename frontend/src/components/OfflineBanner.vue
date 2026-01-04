<script setup>
import { useOnlineStatus } from '../composables/useOnlineStatus'

const { isOnline } = useOnlineStatus()
</script>

<template>
  <Transition name="slide-down">
    <div v-if="!isOnline" class="offline-banner">
      <span class="offline-icon">📡</span>
      <span class="offline-text">オフラインです。接続を確認してください。</span>
    </div>
  </Transition>
</template>

<style scoped>
.offline-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 500;
  z-index: 9999;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.offline-icon {
  font-size: 18px;
}

.offline-text {
  font-size: 14px;
}

/* Transition */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}
</style>
