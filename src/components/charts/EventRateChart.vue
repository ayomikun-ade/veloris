<script setup lang="ts">
import { computed, ref } from 'vue'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Chart01Icon } from '@hugeicons/core-free-icons'
import '@/lib/echarts'
import type { Severity } from '@/types/event'
import { useTimeseriesStore } from '@/stores/timeseries'
import { useFiltersStore, TIME_RANGE_LABEL } from '@/stores/filters'
import { useEventsStore } from '@/stores/events'
import { useChartTheme } from '@/composables/useChartTheme'
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import ChartSkeleton from '@/components/ChartSkeleton.vue'
import ChartTypePicker from '@/components/ChartTypePicker.vue'

type ChartType = 'area' | 'line' | 'bar'
const TYPES = [
  { value: 'area', label: 'Area' },
  { value: 'line', label: 'Line' },
  { value: 'bar', label: 'Bar' },
] as const satisfies ReadonlyArray<{ value: ChartType; label: string }>

const SEVS: Severity[] = ['info', 'low', 'medium', 'high', 'critical']

const events = useEventsStore()
const timeseries = useTimeseriesStore()
const filters = useFiltersStore()
const theme = useChartTheme()
const reducedMotion = usePrefersReducedMotion()

const chartType = ref<ChartType>('area')

const hasData = computed(() => events.bufferSize > 0)

const option = computed<EChartsOption>(() => {
  const t = theme.value
  const buckets = timeseries.lastNSeconds(filters.timeRangeSec)
  const active = filters.activeSeverities
  const points = buckets.map((b) => {
    let total = 0
    for (const s of SEVS) if (active.has(s)) total += b.counts[s]
    return [b.t * 1000, total]
  })

  const baseSeries = {
    name: 'events / sec',
    data: points,
    emphasis: { focus: 'series' as const },
  }

  let series: EChartsOption['series']
  if (chartType.value === 'bar') {
    series = [
      {
        ...baseSeries,
        type: 'bar',
        itemStyle: { color: t.accent, borderRadius: [3, 3, 0, 0] },
        barMaxWidth: 8,
      },
    ]
  } else if (chartType.value === 'line') {
    series = [
      {
        ...baseSeries,
        type: 'line',
        smooth: 0.3,
        showSymbol: false,
        lineStyle: { color: t.accent, width: 2 },
      },
    ]
  } else {
    series = [
      {
        ...baseSeries,
        type: 'line',
        smooth: 0.3,
        showSymbol: false,
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
      },
    ]
  }

  return {
    animation: !reducedMotion.value,
    animationDurationUpdate: 0,
    aria: { enabled: true },
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
    series,
  }
})
</script>

<template>
  <div class="flex h-full flex-col p-4">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-sm font-semibold">Event rate</p>
        <p class="text-xs text-muted">
          events / second · last {{ TIME_RANGE_LABEL[filters.timeRangeSec] }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <ChartTypePicker
          :type="chartType"
          :options="TYPES"
          @update:type="(v) => (chartType = v)"
        />
        <HugeiconsIcon :icon="Chart01Icon" :size="18" class="text-muted" />
      </div>
    </div>
    <div class="mt-3 min-h-0 flex-1">
      <VChart v-if="hasData" :option="option" autoresize class="h-full w-full" />
      <ChartSkeleton v-else />
    </div>
  </div>
</template>
