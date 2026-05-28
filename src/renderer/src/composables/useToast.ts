import { reactive } from 'vue'

export interface ToastItem {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  message: string
  duration?: number
}

const toasts = reactive<ToastItem[]>([])

let idCounter = 0

export function useToast() {
  function add(type: ToastItem['type'], message: string, duration = 4000) {
    const id = `toast-${++idCounter}-${Date.now()}`
    const toast: ToastItem = { id, type, message, duration }
    toasts.push(toast)

    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }

    return id
  }

  function remove(id: string) {
    const idx = toasts.findIndex(t => t.id === id)
    if (idx !== -1) {
      toasts.splice(idx, 1)
    }
  }

  function success(message: string, duration?: number) {
    return add('success', message, duration)
  }

  function warning(message: string, duration?: number) {
    return add('warning', message, duration)
  }

  function error(message: string, duration?: number) {
    return add('error', message, duration)
  }

  function info(message: string, duration?: number) {
    return add('info', message, duration)
  }

  return {
    toasts,
    add,
    remove,
    success,
    warning,
    error,
    info
  }
}
