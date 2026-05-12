<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useConnectionStore } from '@/stores/connection'
import { useEventsStore } from '@/stores/events'

const connection = useConnectionStore()
const events = useEventsStore()

const fps = ref(0)
const heapMb = ref<number | null>(null)

interface PerfMemory {
  usedJSHeapSize: number
}

function readHeap(): number | null {
  const perf = performance as Performance & { memory?: PerfMemory }
  return perf.memory ? perf.memory.usedJSHeapSize / 1_048_576 : null
}

let rafId: number | null = null
let heapIntervalId: number | null = null
let frames = 0
let lastSample = performance.now()

function tick(now: number) {
  frames++
  if (now - lastSample >= 500) {
    fps.value = Math.round((frames * 1000) / (now - lastSample))
    frames = 0
    lastSample = now
  }
  rafId = requestAnimationFrame(tick)
}

onMounted(() => {
  rafId = requestAnimationFrame(tick)
  heapMb.value = readHeap()
  heapIntervalId = window.setInterval(() => {
    heapMb.value = readHeap()
  }, 1000)
})

onBeforeUnmount(() => {
  if (rafId !== null) cancelAnimationFrame(rafId)
  if (heapIntervalId !== null) clearInterval(heapIntervalId)
})
</script>

<template>
  <div
    class="pointer-events-none fixed right-4 bottom-4 z-50 min-w-[180px] space-y-1 rounded-lg border bg-surface/95 px-3 py-2.5 font-mono text-[11px] shadow-lg backdrop-blur"
    role="status"
    aria-label="Performance overlay"
  >
    <div class="flex items-center justify-between gap-4 border-b pb-1.5">
      <span class="text-muted">perf</span>
      <span class="text-[10px] tracking-[0.18em] text-muted uppercase">?perf=1</span>
    </div>
    <div class="flex items-center justify-between gap-4">
      <span class="text-muted">fps</span>
      <span class="tabular-nums">{{ fps }}</span>
    </div>
    <div class="flex items-center justify-between gap-4">
      <span class="text-muted">heap</span>
      <span class="tabular-nums">
        <template v-if="heapMb !== null">{{ heapMb.toFixed(1) }} MB</template>
        <template v-else>—</template>
      </span>
    </div>
    <div class="flex items-center justify-between gap-4">
      <span class="text-muted">buffer</span>
      <span class="tabular-nums">{{ events.bufferSize }} / {{ events.MAX_EVENTS }}</span>
    </div>
    <div class="flex items-center justify-between gap-4">
      <span class="text-muted">ingested</span>
      <span class="tabular-nums">{{ events.totalIngested.toLocaleString() }}</span>
    </div>
    <div class="flex items-center justify-between gap-4">
      <span class="text-muted">throughput</span>
      <span class="tabular-nums">{{ connection.throughput }}/s</span>
    </div>
    <div class="flex items-center justify-between gap-4">
      <span class="text-muted">dropped</span>
      <span class="tabular-nums">{{ connection.droppedPayloads }}</span>
    </div>
  </div>
</template>
