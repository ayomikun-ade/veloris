import { onScopeDispose } from 'vue'
import { useConnectionStore } from '@/stores/connection'
import { useEventsStore } from '@/stores/events'
import { ThreatEventSchema, type ThreatEvent } from '@/types/event'
import StreamWorker from '@/workers/stream.worker?worker'

type WorkerOutput =
  | { type: 'batch'; events: unknown[] }
  | { type: 'status'; state: 'connected' | 'paused' }

export function useStreamConnection() {
  const connection = useConnectionStore()
  const events = useEventsStore()

  const worker = new StreamWorker()

  worker.onmessage = (e: MessageEvent<WorkerOutput>) => {
    const msg = e.data
    if (msg.type === 'batch') {
      const valid: ThreatEvent[] = []
      for (const raw of msg.events) {
        const result = ThreatEventSchema.safeParse(raw)
        if (result.success) valid.push(result.data)
        else connection.recordDropped()
      }
      if (valid.length > 0) events.ingest(valid)
    } else if (msg.type === 'status') {
      connection.setState(msg.state)
    }
  }

  worker.onerror = () => {
    connection.setState('disconnected')
  }

  function start() {
    connection.setState('connecting')
    worker.postMessage({ type: 'start' })
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
    connection.setState('disconnected')
  }

  onScopeDispose(() => {
    worker.postMessage({ type: 'stop' })
    worker.terminate()
  })

  return { start, pause, resume, setThroughput, stop }
}
