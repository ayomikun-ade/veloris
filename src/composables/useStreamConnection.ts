import { inject, onScopeDispose, type InjectionKey } from 'vue'
import { useConnectionStore } from '@/stores/connection'
import { useEventsStore } from '@/stores/events'
import { useTimeseriesStore } from '@/stores/timeseries'
import { ThreatEventSchema, type ThreatEvent } from '@/types/event'
import StreamWorker from '@/workers/stream.worker?worker'

type WorkerOutput =
  | { type: 'batch'; events: unknown[] }
  | { type: 'status'; state: 'connected' | 'paused' }

const TICK_INTERVAL_MS = 1000

export interface StreamController {
  start(): void
  pause(): void
  resume(): void
  setThroughput(eventsPerSec: number): void
  stop(): void
}

export const streamKey: InjectionKey<StreamController> = Symbol('veloris-stream')

export function useStreamConnection(): StreamController {
  const connection = useConnectionStore()
  const events = useEventsStore()
  const timeseries = useTimeseriesStore()

  const worker = new StreamWorker()
  let tickId: number | null = null

  worker.onmessage = (e: MessageEvent<WorkerOutput>) => {
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
      }
    } else if (msg.type === 'status') {
      connection.setState(msg.state)
    }
  }

  worker.onerror = () => {
    connection.setState('disconnected')
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

  function start() {
    connection.setState('connecting')
    worker.postMessage({ type: 'start' })
    startTick()
  }
  function pause() {
    worker.postMessage({ type: 'pause' })
  }
  function resume() {
    worker.postMessage({ type: 'resume' })
  }
  function setThroughput(eventsPerSec: number) {
    connection.setThroughput(eventsPerSec)
    worker.postMessage({ type: 'set-throughput', eventsPerSec })
  }
  function stop() {
    worker.postMessage({ type: 'stop' })
    worker.terminate()
    stopTick()
    connection.setState('disconnected')
  }

  onScopeDispose(() => {
    worker.postMessage({ type: 'stop' })
    worker.terminate()
    stopTick()
  })

  return { start, pause, resume, setThroughput, stop }
}

export function useStream(): StreamController {
  const stream = inject(streamKey)
  if (!stream) {
    throw new Error('useStream() called without a stream provider in the ancestor tree')
  }
  return stream
}
