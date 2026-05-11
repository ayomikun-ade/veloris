<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'
import '@/lib/echarts'
import { CATEGORIES, type Category } from '@/types/event'
import { useEventsStore } from '@/stores/events'
import { useFiltersStore } from '@/stores/filters'
import { useChartTheme } from '@/composables/useChartTheme'
import { useNow } from '@/composables/useNow'

const BUCKET_MIN = 5
const N_BUCKETS = 12
const BUCKET_MS = BUCKET_MIN * 60_000

const events = useEventsStore()
const filters = useFiltersStore()
const theme = useChartTheme()
const now = useNow()

const option = computed<EChartsOption>(() => {
  const t = theme.value
  const active = filters.activeSeverities
  const nowMs = now.value
  const bucketEnd = Math.floor(nowMs / BUCKET_MS) * BUCKET_MS + BUCKET_MS
  const bucketStart = bucketEnd - N_BUCKETS * BUCKET_MS

  // counts[bucketIdx][categoryIdx]
  const counts: number[][] = Array.from({ length: N_BUCKETS }, () =>
    new Array<number>(CATEGORIES.length).fill(0),
  )

  for (const ev of events.events) {
    if (!active.has(ev.severity)) continue
    if (ev.timestamp < bucketStart || ev.timestamp >= bucketEnd) continue
    const bIdx = Math.floor((ev.timestamp - bucketStart) / BUCKET_MS)
    const cIdx = CATEGORIES.indexOf(ev.category as Category)
    if (cIdx >= 0) counts[bIdx][cIdx]++
  }

  // ECharts heatmap data: [xIdx, yIdx, value]
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
    animation: true,
    animationDurationUpdate: 0,
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
  <VChart :option="option" autoresize class="h-full w-full" />
</template>
