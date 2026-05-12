<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'
import '@/lib/echarts'
import type { Severity } from '@/types/event'
import { useTimeseriesStore } from '@/stores/timeseries'
import { useFiltersStore } from '@/stores/filters'
import { useChartTheme } from '@/composables/useChartTheme'
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'

const timeseries = useTimeseriesStore()
const filters = useFiltersStore()
const theme = useChartTheme()
const reducedMotion = usePrefersReducedMotion()

const SEVERITY_ORDER: Severity[] = ['info', 'low', 'medium', 'high', 'critical']

const option = computed<EChartsOption>(() => {
  const t = theme.value
  const buckets = timeseries.lastNSeconds(filters.timeRangeSec)
  const visible = SEVERITY_ORDER.filter((s) => filters.activeSeverities.has(s))

  const series = visible.map((sev) => ({
    name: sev,
    type: 'line' as const,
    stack: 'severity',
    showSymbol: false,
    smooth: false,
    data: buckets.map((b) => [b.t * 1000, b.counts[sev]]),
    lineStyle: { width: 0 },
    areaStyle: { color: t.severity[sev], opacity: 0.8 },
    emphasis: { focus: 'series' as const },
  }))

  return {
    animation: !reducedMotion.value,
    animationDurationUpdate: 0,
    aria: { enabled: true },
    color: visible.map((s) => t.severity[s]),
    legend: {
      data: visible,
      bottom: 0,
      textStyle: { color: t.muted, fontSize: 10 },
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 10,
    },
    grid: { left: 36, right: 12, top: 14, bottom: 36, containLabel: false },
    xAxis: {
      type: 'time',
      axisLine: { lineStyle: { color: t.border } },
      axisTick: { show: false },
      axisLabel: { color: t.muted, fontSize: 10, hideOverlap: true },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: t.muted, fontSize: 10 },
      splitLine: { lineStyle: { color: t.grid } },
      splitNumber: 3,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: t.tooltipBg,
      borderColor: t.border,
      textStyle: { color: t.text, fontSize: 12 },
      axisPointer: { type: 'line', lineStyle: { color: t.border } },
    },
    series,
  }
})
</script>

<template>
  <VChart :option="option" autoresize class="h-full w-full" />
</template>
