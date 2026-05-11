import { shallowRef, triggerRef } from 'vue'
import { defineStore } from 'pinia'
import { SEVERITIES, type Severity, type ThreatEvent } from '@/types/event'

/**
 * Buffer the last hour so any time-range up to 1h can be served from memory
 * without re-ingesting. Buckets are ~80 bytes each — 3600 × 80 ≈ 280 KB.
 */
const WINDOW_SECONDS = 3600

export interface SeverityCounts {
  info: number
  low: number
  medium: number
  high: number
  critical: number
}

export interface Bucket {
  t: number
  counts: SeverityCounts
}

function emptyCounts(): SeverityCounts {
  return { info: 0, low: 0, medium: 0, high: 0, critical: 0 }
}

function nowSec(): number {
  return Math.floor(Date.now() / 1000)
}

function initialBuckets(): Bucket[] {
  const now = nowSec()
  const buckets: Bucket[] = new Array(WINDOW_SECONDS)
  for (let i = 0; i < WINDOW_SECONDS; i++) {
    buckets[i] = { t: now - (WINDOW_SECONDS - 1 - i), counts: emptyCounts() }
  }
  return buckets
}

export const useTimeseriesStore = defineStore('timeseries', () => {
  const buckets = shallowRef<Bucket[]>(initialBuckets())

  function ingest(batch: ThreatEvent[]) {
    if (batch.length === 0) return
    const list = buckets.value
    const lastIdx = list.length - 1
    const lastT = list[lastIdx].t
    for (const ev of batch) {
      const key = Math.floor(ev.timestamp / 1000)
      const offset = lastT - key
      if (offset < 0 || offset >= WINDOW_SECONDS) continue
      list[lastIdx - offset].counts[ev.severity]++
    }
    triggerRef(buckets)
  }

  function tick() {
    const list = buckets.value
    const last = list[list.length - 1]
    const cur = nowSec()
    if (last.t >= cur) return
    const steps = Math.min(cur - last.t, WINDOW_SECONDS)
    for (let s = 1; s <= steps; s++) {
      list.push({ t: last.t + s, counts: emptyCounts() })
    }
    while (list.length > WINDOW_SECONDS) list.shift()
    triggerRef(buckets)
  }

  function clear() {
    buckets.value = initialBuckets()
    triggerRef(buckets)
  }

  function lastNSeconds(n: number): Bucket[] {
    const list = buckets.value
    if (n >= list.length) return list
    return list.slice(list.length - n)
  }

  function totalOf(b: Bucket): number {
    let n = 0
    for (const s of SEVERITIES) n += b.counts[s satisfies Severity]
    return n
  }

  return {
    buckets,
    ingest,
    tick,
    clear,
    totalOf,
    lastNSeconds,
    WINDOW_SECONDS,
  }
})
