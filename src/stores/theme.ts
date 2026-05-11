import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

type Mode = 'light' | 'dark'

const STORAGE_KEY = 'veloris-theme'

function detectInitial(): Mode {
  if (typeof window === 'undefined') return 'dark'
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // localStorage may be unavailable (private mode, blocked storage)
  }
  return 'dark'
}

function applyMode(mode: Mode) {
  document.documentElement.classList.toggle('dark', mode === 'dark')
}

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<Mode>(detectInitial())
  applyMode(mode.value)

  const isDark = computed(() => mode.value === 'dark')

  function setMode(next: Mode) {
    mode.value = next
    applyMode(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // non-fatal
    }
  }

  function toggle() {
    setMode(mode.value === 'dark' ? 'light' : 'dark')
  }

  return { mode, isDark, setMode, toggle }
})
