<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'
import { HugeiconsIcon } from '@hugeicons/vue'
import { GridViewIcon } from '@hugeicons/core-free-icons'
import '@/lib/echarts'
import { CATEGORIES, type Category, type ThreatEvent } from '@/types/event'
import { useEventsStore } from '@/stores/events'
import { useFiltersStore } from '@/stores/filters'
import { useChartTheme } from '@/composables/useChartTheme'
import { useNow } from '@/composables/useNow'
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import ChartSkeleton from '@/components/ChartSkeleton.vue'

const BUCKET_MIN = 5
const N_BUCKETS = 12
const BUCKET_MS = BUCKET_MIN * 60_000
const AGGREGATION_INTERVAL_MS = 1000

const events = useEventsStore()
const filters = useFiltersStore()
const theme = useChartTheme()
const now = useNow()
const reducedMotion = usePrefersReducedMotion()

const hasData = computed(() => events.bufferSize > 0)

/**
 * 1 Hz throttled snapshot. The events store triggers ~10 times/sec at the
 * default throughput; recomputing an O(buffer × categories) aggregation that
 * often is wasteful when the heatmap's smallest visual unit is a 5-minute
 * bucket. Snapshotting once a second keeps the heatmap visibly live without
 * burning CPU on indistinguishable frames.
 */
const snapshot = shallowRef<ThreatEvent[]>(events.events)
let scheduled: number | null = null

watch(
  () => events.events,
  () => {
    if (scheduled !== null) return
    scheduled = window.setTimeout(() => {
      snapshot.value = events.events
      scheduled = null
    }, AGGREGATION_INTERVAL_MS)
  },
)

onBeforeUnmount(() => {
  if (scheduled !== null) {
    clearTimeout(scheduled)
    scheduled = null
  }
})

const option = computed<EChartsOption>(() => {
  const t = theme.value
  const active = filters.activeSeverities
  const nowMs = now.value
  const bucketEnd = Math.floor(nowMs / BUCKET_MS) * BUCKET_MS + BUCKET_MS
  const bucketStart = bucketEnd - N_BUCKETS * BUCKET_MS

  const counts: number[][] = Array.from({ length: N_BUCKETS }, () =>
    new Array<number>(CATEGORIES.length).fill(0),
  )

  for (const ev of snapshot.value) {
    if (!active.has(ev.severity)) continue
    if (ev.timestamp < bucketStart || ev.timestamp >= bucketEnd) continue
    const bIdx = Math.floor((ev.timestamp - bucketStart) / BUCKET_MS)
    const cIdx = CATEGORIES.indexOf(ev.category as Category)
    if (cIdx >= 0) counts[bIdx][cIdx]++
  }

  const data: [number, number, number][] = []
  let max = 1
  for (let b = 0; b < N_BUCKETS; b++) {
    for (let c = 0; c < CATEGORIES.length; c++) {
      const v = counts[b][c]
      data.push([b, c, v])
      if (v > max) max = v
    }
  }

  const xLabels: string[] = []
  for (let i = 0; i < N_BUCKETS; i++) {
    const minutesAgo = (N_BUCKETS - 1 - i) * BUCKET_MIN
    xLabels.push(minutesAgo === 0 ? 'now' : `${minutesAgo}m`)
  }

  return {
    animation: !reducedMotion.value,
    animationDurationUpdate: 0,
    aria: { enabled: true },
    grid: { left: 124, right: 70, top: 8, bottom: 28, containLabel: false },
    xAxis: {
      type: 'category',
      data: xLabels,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: t.muted, fontSize: 10 },
      splitArea: { show: false },
    },
    yAxis: {
      type: 'category',
      data: CATEGORIES as unknown as string[],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: t.muted, fontSize: 11 },
      splitArea: { show: false },
    },
    tooltip: {
      position: 'top',
      backgroundColor: t.tooltipBg,
      borderColor: t.border,
      textStyle: { color: t.text, fontSize: 12 },
      formatter: (params) => {
        const p = params as unknown as { value: [number, number, number] }
        const cat = CATEGORIES[p.value[1]]
        const x = xLabels[p.value[0]]
        return `<div style="font-weight:600">${cat}</div><div style="color:${t.muted}">${x} · ${p.value[2]} events</div>`
      },
    },
    visualMap: {
      min: 0,
      max,
      calculable: false,
      orient: 'vertical',
      right: 8,
      top: 'center',
      itemHeight: 140,
      itemWidth: 8,
      textStyle: { color: t.muted, fontSize: 10 },
      inRange: { color: [t.surface, t.accent] },
    },
    series: [
      {
        type: 'heatmap',
        data,
        label: { show: false },
        itemStyle: {
          borderColor: t.border,
          borderWidth: 1,
        },
        emphasis: {
          itemStyle: {
            borderColor: t.accent,
            borderWidth: 1.5,
          },
        },
      },
    ],
  }
})
</script>

<template>
  <div class="flex h-full flex-col p-4">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-sm font-semibold">Activity heatmap</p>
        <p class="text-xs text-muted">
          events per category in 5-minute buckets · last hour
        </p>
      </div>
      <HugeiconsIcon :icon="GridViewIcon" :size="18" class="text-muted" />
    </div>
    <div class="mt-3 min-h-0 flex-1">
      <VChart v-if="hasData" :option="option" autoresize class="h-full w-full" />
      <ChartSkeleton v-else />
    </div>
  </div>
</template>
