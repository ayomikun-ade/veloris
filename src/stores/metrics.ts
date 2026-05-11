import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useEventsStore } from '@/stores/events'

const RATE_WINDOW_MS = 5000

export const useMetricsStore = defineStore('metrics', () => {
  const eventsStore = useEventsStore()

  /**
   * Events per second averaged over the last RATE_WINDOW_MS.
   * Events are newest-first so we break as soon as we leave the window.
   */
  const eventsPerSecond = computed(() => {
    const buffer = eventsStore.events
    if (buffer.length === 0) return 0
    const cutoff = Date.now() - RATE_WINDOW_MS
    let count = 0
    for (let i = 0; i < buffer.length; i++) {
      if (buffer[i].timestamp >= cutoff) count++
      else break
    }
    return count / (RATE_WINDOW_MS / 1000)
  })

  const criticalCount = computed(() => {
    let n = 0
    for (const ev of eventsStore.events) if (ev.severity === 'critical') n++
    return n
  })

  const blockedRate = computed(() => {
    const buffer = eventsStore.events
    if (buffer.length === 0) return 0
    let blocked = 0
    for (const ev of buffer) {
      if (ev.status === 'blocked' || ev.status === 'mitigated') blocked++
    }
    return blocked / buffer.length
  })

  return { eventsPerSecond, criticalCount, blockedRate }
})
