import { inject, onScopeDispose, type InjectionKey } from 'vue'
import { useConnectionStore } from '@/stores/connection'
import { useEventsStore } from '@/stores/events'
import { useTimeseriesStore } from '@/stores/timeseries'
import { useToastsStore } from '@/stores/toasts'
import type { ThreatEvent } from '@/types/event'
import { ThreatEventSchema } from '@/types/event.schema'
import { playCriticalChime } from '@/lib/sound'
import StreamWorker from '@/workers/stream.worker?worker'

type WorkerOutput =
  | { type: 'batch'; events: unknown[] }
  | { type: 'status'; state: 'connected' | 'paused' }

const TICK_INTERVAL_MS = 1000
const INITIAL_BACKOFF_MS = 1000
const MAX_BACKOFF_MS = 30_000
const CRITICAL_TOAST_THROTTLE_MS = 3000

export interface StreamController {
  start(): void
  pause(): void
  resume(): void
  setThroughput(eventsPerSec: number): void
  stop(): void
  simulateDisconnect(): void
}

export const streamKey: InjectionKey<StreamController> = Symbol('veloris-stream')

export function useStreamConnection(): StreamController {
  const connection = useConnectionStore()
  const events = useEventsStore()
  const timeseries = useTimeseriesStore()
  const toasts = useToastsStore()

  let worker: Worker | null = null
  let tickId: number | null = null
  let reconnectTimer: number | null = null
  let lastCriticalToastAt = 0
  let autoReconnect = true

  function attach(w: Worker) {
    w.onmessage = (e: MessageEvent<WorkerOutput>) => {
      const msg = e.data
      if (msg.type === 'batch') {
        const valid: ThreatEvent[] = []
        for (const raw of msg.events) {
          const result = ThreatEventSchema.safeParse(raw)
          if (result.success) valid.push(result.data)
          else connection.recordDropped()
        }
        if (valid.length > 0) {
          events.ingest(valid)
          timeseries.ingest(valid)
          maybeToastCritical(valid)
        }
      } else if (msg.type === 'status') {
        connection.setState(msg.state)
      }
    }
    w.onerror = () => {
      handleDrop()
    }
  }

  function spawn() {
    const w = new StreamWorker()
    attach(w)
    worker = w
  }

  function handleDrop() {
    if (worker) {
      worker.terminate()
      worker = null
    }
    connection.setState('disconnected')
    if (autoReconnect) scheduleReconnect()
  }

  function scheduleReconnect() {
    if (reconnectTimer !== null) return
    const attempt = connection.reconnectAttempt
    const delay = Math.min(INITIAL_BACKOFF_MS * 2 ** attempt, MAX_BACKOFF_MS)
    connection.setReconnectAt(Date.now() + delay)
    reconnectTimer = window.setTimeout(() => {
      reconnectTimer = null
      doReconnect()
    }, delay)
  }

  function doReconnect() {
    connection.incrementReconnectAttempt()
    connection.setReconnectAt(null)
    spawn()
    connection.setState('connecting')
    worker?.postMessage({ type: 'start' })
  }

  function maybeToastCritical(batch: ThreatEvent[]) {
    const now = Date.now()
    if (now - lastCriticalToastAt < CRITICAL_TOAST_THROTTLE_MS) return
    const critical = batch.find((e) => e.severity === 'critical')
    if (!critical) return
    lastCriticalToastAt = now
    toasts.push({
      variant: 'critical',
      title: `Critical · ${critical.category}`,
      description: `${critical.sourceIp} → ${critical.targetAsset}`,
    })
    if (toasts.soundEnabled) playCriticalChime()
  }

  function startTick() {
    if (tickId !== null) return
    tickId = window.setInterval(() => timeseries.tick(), TICK_INTERVAL_MS)
  }
  function stopTick() {
    if (tickId !== null) {
      window.clearInterval(tickId)
      tickId = null
    }
  }
  function clearReconnect() {
    if (reconnectTimer !== null) {
      window.clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    connection.setReconnectAt(null)
  }

  function start() {
    autoReconnect = true
    if (!worker) spawn()
    connection.setState('connecting')
    worker?.postMessage({ type: 'start' })
    startTick()
  }
  function pause() {
    worker?.postMessage({ type: 'pause' })
  }
  function resume() {
    worker?.postMessage({ type: 'resume' })
  }
  function setThroughput(eventsPerSec: number) {
    connection.setThroughput(eventsPerSec)
    worker?.postMessage({ type: 'set-throughput', eventsPerSec })
  }
  function stop() {
    autoReconnect = false
    clearReconnect()
    if (worker) {
      worker.postMessage({ type: 'stop' })
      worker.terminate()
      worker = null
    }
    stopTick()
    connection.setState('disconnected')
  }
  function simulateDisconnect() {
    autoReconnect = true
    handleDrop()
  }

  onScopeDispose(() => {
    autoReconnect = false
    clearReconnect()
    if (worker) {
      worker.postMessage({ type: 'stop' })
      worker.terminate()
      worker = null
    }
    stopTick()
  })

  return { start, pause, resume, setThroughput, stop, simulateDisconnect }
}

export function useStream(): StreamController {
  const stream = inject(streamKey)
  if (!stream) {
    throw new Error('useStream() called without a stream provider in the ancestor tree')
  }
  return stream
}
