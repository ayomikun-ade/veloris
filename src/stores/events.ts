import { computed, ref, shallowRef, triggerRef } from 'vue'
import { defineStore } from 'pinia'
import type { ThreatEvent } from '@/types/event'

const MAX_EVENTS = 5000

export const useEventsStore = defineStore('events', () => {
  /**
   * Capped, newest-first buffer of recent events.
   * shallowRef + triggerRef avoids per-event deep reactivity — Vue only
   * tracks identity changes, which is critical for sustained throughput.
   */
  const events = shallowRef<ThreatEvent[]>([])
  const totalIngested = ref(0)

  function ingest(batch: ThreatEvent[]) {
    if (batch.length === 0) return
    const list = events.value
    // batch arrives oldest -> newest; prepend in reverse to keep newest first
    for (let i = batch.length - 1; i >= 0; i--) {
      list.unshift(batch[i])
    }
    if (list.length > MAX_EVENTS) list.length = MAX_EVENTS
    totalIngested.value += batch.length
    triggerRef(events)
  }

  function clear() {
    events.value = []
    triggerRef(events)
  }

  const bufferSize = computed(() => events.value.length)

  return {
    events,
    totalIngested,
    bufferSize,
    ingest,
    clear,
    MAX_EVENTS,
  }
})
