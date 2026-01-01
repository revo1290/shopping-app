import { ref } from 'vue'

const toasts = ref([])
let toastId = 0

export function useToast() {
  function addToast(message, type = 'info', duration = 3000) {
    const id = ++toastId
    toasts.value.push({
      id,
      message,
      type,
      visible: true
    })

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }

  function removeToast(id) {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value[index].visible = false
      setTimeout(() => {
        toasts.value = toasts.value.filter(t => t.id !== id)
      }, 300)
    }
  }

  function success(message, duration = 3000) {
    return addToast(message, 'success', duration)
  }

  function error(message, duration = 5000) {
    return addToast(message, 'error', duration)
  }

  function warning(message, duration = 4000) {
    return addToast(message, 'warning', duration)
  }

  function info(message, duration = 3000) {
    return addToast(message, 'info', duration)
  }

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  }
}
