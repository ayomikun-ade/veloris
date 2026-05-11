import { onScopeDispose, ref, type Ref } from 'vue'

/**
 * Shared 1-second ticking ref. Multiple consumers reuse a single interval
 * via reference counting; the interval is torn down when the last consumer's
 * scope is disposed.
 */
const now = ref(Date.now())
let refCount = 0
let intervalId: number | null = null

function start() {
  if (intervalId !== null) return
  intervalId = window.setInterval(() => {
    now.value = Date.now()
  }, 1000)
}

function stop() {
  if (intervalId !== null) {
    window.clearInterval(intervalId)
    intervalId = null
  }
}

export function useNow(): Ref<number> {
  refCount++
  start()
  onScopeDispose(() => {
    refCount--
    if (refCount === 0) stop()
  })
  return now
}
