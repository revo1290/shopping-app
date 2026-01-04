import { ref, onMounted, onUnmounted } from 'vue'

/**
 * オンライン/オフライン状態を監視するcomposable
 */
export function useOnlineStatus() {
  const isOnline = ref(navigator.onLine)
  const wasOffline = ref(false)

  function handleOnline() {
    isOnline.value = true
    // オフラインから復帰した場合はフラグを立てる
    if (wasOffline.value) {
      wasOffline.value = false
    }
  }

  function handleOffline() {
    isOnline.value = false
    wasOffline.value = true
  }

  onMounted(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })

  return {
    isOnline,
    wasOffline
  }
}
