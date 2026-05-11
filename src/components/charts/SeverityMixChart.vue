<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'
import '@/lib/echarts'
import { SEVERITIES } from '@/types/event'
import { useTimeseriesStore } from '@/stores/timeseries'
import { useChartTheme } from '@/composables/useChartTheme'

const timeseries = useTimeseriesStore()
const theme = useChartTheme()

const SEVERITY_ORDER = ['info', 'low', 'medium', 'high', 'critical'] as const

const option = computed<EChartsOption>(() => {
  const t = theme.value
  const buckets = timeseries.buckets

  const series = SEVERITY_ORDER.map((sev) => ({
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
    animation: true,
    animationDurationUpdate: 0,
    color: SEVERITIES.map((s) => t.severity[s]),
    legend: {
      data: SEVERITY_ORDER.map((s) => s),
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
