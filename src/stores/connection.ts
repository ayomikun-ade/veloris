import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'paused' | 'disconnected'

export const useConnectionStore = defineStore('connection', () => {
  const state = ref<ConnectionState>('idle')
  const throughput = ref(25)
  const droppedPayloads = ref(0)

  const reconnectAttempt = ref(0)
  /** Absolute timestamp (ms since epoch) of the next reconnect attempt. */
  const reconnectAt = ref<number | null>(null)

  const isLive = computed(() => state.value === 'connected')
  const isPaused = computed(() => state.value === 'paused')
  const isDisconnected = computed(() => state.value === 'disconnected')

  function setState(next: ConnectionState) {
    state.value = next
    if (next === 'connected' || next === 'paused') {
      reconnectAttempt.value = 0
      reconnectAt.value = null
    }
  }

  function setThroughput(next: number) {
    throughput.value = Math.max(1, Math.min(1000, next))
  }

  function recordDropped(n = 1) {
    droppedPayloads.value += n
  }

  function incrementReconnectAttempt() {
    reconnectAttempt.value += 1
  }

  function setReconnectAt(ts: number | null) {
    reconnectAt.value = ts
  }

  return {
    state,
    throughput,
    droppedPayloads,
    reconnectAttempt,
    reconnectAt,
    isLive,
    isPaused,
    isDisconnected,
    setState,
    setThroughput,
    recordDropped,
    incrementReconnectAttempt,
    setReconnectAt,
  }
})
