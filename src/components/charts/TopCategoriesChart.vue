<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'
import '@/lib/echarts'
import type { Category } from '@/types/event'
import { useEventsStore } from '@/stores/events'
import { useFiltersStore } from '@/stores/filters'
import { useChartTheme } from '@/composables/useChartTheme'

const TOP_N = 8

const events = useEventsStore()
const filters = useFiltersStore()
const theme = useChartTheme()

const option = computed<EChartsOption>(() => {
  const t = theme.value
  const active = filters.activeSeverities
  const counts = new Map<Category, number>()
  for (const ev of events.events) {
    if (!active.has(ev.severity)) continue
    counts.set(ev.category, (counts.get(ev.category) ?? 0) + 1)
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, TOP_N)
  const names = sorted.map(([n]) => n).reverse()
  const values = sorted.map(([, c]) => c).reverse()

  return {
    animation: true,
    animationDurationUpdate: 0,
    grid: { left: 110, right: 28, top: 8, bottom: 22, containLabel: false },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: t.muted, fontSize: 10 },
      splitLine: { lineStyle: { color: t.grid } },
      splitNumber: 3,
    },
    yAxis: {
      type: 'category',
      data: names,
      axisLine: { lineStyle: { color: t.border } },
      axisTick: { show: false },
      axisLabel: { color: t.muted, fontSize: 11 },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: t.tooltipBg,
      borderColor: t.border,
      textStyle: { color: t.text, fontSize: 12 },
    },
    series: [
      {
        type: 'bar',
        data: values,
        itemStyle: { color: t.accent, borderRadius: [0, 4, 4, 0] },
        barMaxWidth: 14,
        label: {
          show: true,
          position: 'right',
          color: t.muted,
          fontSize: 10,
          formatter: '{c}',
        },
      },
    ],
  }
})
</script>

<template>
  <VChart :option="option" autoresize class="h-full w-full" />
</template>
