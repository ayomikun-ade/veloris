<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'
import '@/lib/echarts'
import { useTimeseriesStore } from '@/stores/timeseries'
import { useChartTheme } from '@/composables/useChartTheme'

const timeseries = useTimeseriesStore()
const theme = useChartTheme()

const option = computed<EChartsOption>(() => {
  const t = theme.value
  const points = timeseries.buckets.map((b) => [b.t * 1000, timeseries.totalOf(b)])

  return {
    animation: true,
    animationDurationUpdate: 0,
    grid: { left: 36, right: 12, top: 14, bottom: 22, containLabel: false },
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
      axisPointer: { lineStyle: { color: t.border } },
    },
    series: [
      {
        type: 'line',
        name: 'events / sec',
        data: points,
        showSymbol: false,
        smooth: 0.3,
        lineStyle: { color: t.accent, width: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: t.accent + '66' },
              { offset: 1, color: t.accent + '00' },
            ],
          },
        },
        emphasis: { focus: 'series' },
      },
    ],
  }
})
</script>

<template>
  <VChart :option="option" autoresize class="h-full w-full" />
</template>
