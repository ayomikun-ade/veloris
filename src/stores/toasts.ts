import { ref } from 'vue'
import { defineStore } from 'pinia'

export type ToastVariant = 'info' | 'warning' | 'critical' | 'success'

export interface Toast {
  id: string
  variant: ToastVariant
  title: string
  description?: string
  durationMs: number
}

const SOUND_STORAGE_KEY = 'veloris-sound-alerts'

function loadSoundPref(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(SOUND_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export const useToastsStore = defineStore('toasts', () => {
  const list = ref<Toast[]>([])
  const soundEnabled = ref(loadSoundPref())

  let nextSeq = 0

  function push(opts: Omit<Toast, 'id' | 'durationMs'> & { durationMs?: number }): string {
    nextSeq++
    const id = `t-${Date.now().toString(36)}-${nextSeq}`
    const durationMs = opts.durationMs ?? 5000
    const toast: Toast = { ...opts, id, durationMs }
    list.value = [...list.value, toast]
    if (durationMs > 0) {
      window.setTimeout(() => dismiss(id), durationMs)
    }
    return id
  }

  function dismiss(id: string) {
    list.value = list.value.filter((t) => t.id !== id)
  }

  function clear() {
    list.value = []
  }

  function setSoundEnabled(v: boolean) {
    soundEnabled.value = v
    try {
      window.localStorage.setItem(SOUND_STORAGE_KEY, v ? '1' : '0')
    } catch {
      // non-fatal
    }
  }

  return { list, soundEnabled, push, dismiss, clear, setSoundEnabled }
})
