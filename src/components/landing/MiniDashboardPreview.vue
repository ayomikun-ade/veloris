<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

type Severity = 'info' | 'low' | 'medium' | 'high' | 'critical'

interface MiniEvent {
  id: number
  ip: string
  target: string
  category: string
  severity: Severity
}

const CATEGORIES = [
  'port-scan',
  'brute-force',
  'recon',
  'phishing',
  'malware',
  'sqli',
  'xss',
  'ddos',
]
const TARGETS = ['api-gateway', 'auth-svc', 'users-db', 'payment-svc', 'admin-portal', 'edge-cdn']

const SEVERITIES_W: { sev: Severity; w: number }[] = [
  { sev: 'info', w: 30 },
  { sev: 'low', w: 26 },
  { sev: 'medium', w: 20 },
  { sev: 'high', w: 14 },
  { sev: 'critical', w: 10 },
]

let counter = 0

function pickSeverity(): Severity {
  const total = SEVERITIES_W.reduce((s, x) => s + x.w, 0)
  let r = Math.random() * total
  for (const { sev, w } of SEVERITIES_W) {
    r -= w
    if (r <= 0) return sev
  }
  return 'info'
}

function randomIp(): string {
  return [
    1 + Math.floor(Math.random() * 254),
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    1 + Math.floor(Math.random() * 254),
  ].join('.')
}

function makeEvent(): MiniEvent {
  counter++
  return {
    id: counter,
    ip: randomIp(),
    target: TARGETS[Math.floor(Math.random() * TARGETS.length)],
    category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
    severity: pickSeverity(),
  }
}

const TICKER_LIMIT = 5
const SPARK_POINTS = 48

const ticker = ref<MiniEvent[]>([])
const counts = ref<Record<Severity, number>>({
  info: 0,
  low: 0,
  medium: 0,
  high: 0,
  critical: 0,
})
const spark = ref<number[]>(Array.from({ length: SPARK_POINTS }, () => 10))

function ingest() {
  const ev = makeEvent()
  ticker.value = [ev, ...ticker.value].slice(0, TICKER_LIMIT)
  counts.value[ev.severity]++
}

function shiftSpark() {
  const last = spark.value[spark.value.length - 1]
  // gentle random walk, biased back toward middle
  const drift = (Math.random() - 0.5) * 8 - (last - 15) * 0.1
  const next = Math.max(2, Math.min(28, last + drift))
  spark.value = [...spark.value.slice(1), next]
}

// Slower tempos so the preview reads as "live" without being twitchy.
const eventTimer = window.setInterval(ingest, 900)
const sparkTimer = window.setInterval(shiftSpark, 500)

onBeforeUnmount(() => {
  clearInterval(eventTimer)
  clearInterval(sparkTimer)
})

const sparkPath = computed(() => {
  const points = spark.value
  const max = Math.max(...points, 1)
  const w = 100
  const h = 30
  const step = w / (points.length - 1)
  let d = `M 0 ${(h - (points[0] / max) * h).toFixed(2)}`
  for (let i = 1; i < points.length; i++) {
    d += ` L ${(i * step).toFixed(2)} ${(h - (points[i] / max) * h).toFixed(2)}`
  }
  return d
})

const sparkArea = computed(() => `${sparkPath.value} L 100 30 L 0 30 Z`)

const SEVERITY_DOT: Record<Severity, string> = {
  info: 'bg-severity-info',
  low: 'bg-severity-low',
  medium: 'bg-severity-medium',
  high: 'bg-severity-high',
  critical: 'bg-severity-critical',
}

const SEVERITY_LABEL: Record<Severity, string> = {
  info: 'info',
  low: 'low',
  medium: 'med',
  high: 'high',
  critical: 'crit',
}
</script>

<template>
  <div
    class="relative min-h-105 overflow-hidden rounded-2xl border bg-surface/70 p-5 shadow-2xl shadow-accent/5 backdrop-blur"
  >
    <!-- Header strip -->
    <div class="flex items-center justify-between border-b pb-3">
      <div class="flex items-center gap-2">
        <span class="relative flex h-2 w-2">
          <span
            class="absolute inset-0 inline-flex h-full w-full animate-ping rounded-full bg-severity-low opacity-75"
          />
          <span class="relative inline-flex h-2 w-2 rounded-full bg-severity-low" />
        </span>
        <span class="text-[10px] font-medium tracking-[0.18em] text-muted uppercase">
          Live stream
        </span>
      </div>
      <span class="font-mono text-[10px] tracking-wider text-muted">events / sec</span>
    </div>

    <!-- Sparkline -->
    <div class="mt-3 text-accent" aria-hidden="true">
      <svg viewBox="0 0 100 30" preserveAspectRatio="none" class="h-20 w-full">
        <defs>
          <linearGradient id="velorisSparkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="currentColor" stop-opacity="0.35" />
            <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path :d="sparkArea" fill="url(#velorisSparkGrad)" />
        <path :d="sparkPath" fill="none" stroke="currentColor" stroke-width="0.6" />
      </svg>
    </div>

    <!-- Severity counters -->
    <div class="mt-4 grid grid-cols-5 gap-1">
      <div
        v-for="(c, sev) in counts"
        :key="sev"
        class="flex flex-col items-center gap-1 rounded-md border bg-surface px-1 py-2"
      >
        <span :class="['h-1.5 w-1.5 rounded-full', SEVERITY_DOT[sev]]" />
        <span class="font-mono text-sm font-semibold tabular-nums">{{ c }}</span>
        <span class="text-[9px] tracking-[0.12em] text-muted uppercase">
          {{ SEVERITY_LABEL[sev] }}
        </span>
      </div>
    </div>

    <!-- Event ticker -->
    <div class="mt-5 border-t pt-3">
      <p class="mb-2 text-[10px] tracking-[0.18em] text-muted uppercase">Recent events</p>
      <TransitionGroup
        tag="div"
        class="relative space-y-1.5"
        move-class="transition-transform duration-300 ease-out"
        enter-active-class="transition duration-250 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in absolute inset-x-0"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-for="ev in ticker"
          :key="ev.id"
          class="flex items-center gap-2 font-mono text-[11px]"
        >
          <span :class="['h-1.5 w-1.5 shrink-0 rounded-full', SEVERITY_DOT[ev.severity]]" />
          <span class="min-w-0 flex-1 truncate text-muted">
            <span class="text-text">{{ ev.ip }}</span>
            <span class="text-muted/70"> → </span>
            <span>{{ ev.target }}</span>
            <span class="text-muted/70"> · </span>
            <span>{{ ev.category }}</span>
          </span>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>
