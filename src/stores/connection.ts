import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'paused' | 'disconnected'

export const useConnectionStore = defineStore('connection', () => {
  const state = ref<ConnectionState>('idle')
  const throughput = ref(25)
  const droppedPayloads = ref(0)

  const isLive = computed(() => state.value === 'connected')
  const isPaused = computed(() => state.value === 'paused')

  function setState(next: ConnectionState) {
    state.value = next
  }

  function setThroughput(next: number) {
    throughput.value = Math.max(1, Math.min(1000, next))
  }

  function recordDropped(n = 1) {
    droppedPayloads.value += n
  }

  return {
    state,
    throughput,
    droppedPayloads,
    isLive,
    isPaused,
    setState,
    setThroughput,
    recordDropped,
  }
})
