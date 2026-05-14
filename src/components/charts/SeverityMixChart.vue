<script setup lang="ts">
import { computed, ref } from 'vue'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'
import { HugeiconsIcon } from '@hugeicons/vue'
import { ChartAreaIcon } from '@hugeicons/core-free-icons'
import '@/lib/echarts'
import type { Severity } from '@/types/event'
import { useTimeseriesStore } from '@/stores/timeseries'
import { useFiltersStore, TIME_RANGE_LABEL } from '@/stores/filters'
import { useEventsStore } from '@/stores/events'
import { useChartTheme } from '@/composables/useChartTheme'
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import { useThrottledRef } from '@/composables/useThrottledRef'
import ChartSkeleton from '@/components/ChartSkeleton.vue'
import ChartTypePicker from '@/components/ChartTypePicker.vue'

type ChartType = 'area' | 'bar'
const TYPES = [
  { value: 'area', label: 'Area' },
  { value: 'bar', label: 'Bar' },
] as const satisfies ReadonlyArray<{ value: ChartType; label: string }>

const SEVERITY_ORDER: Severity[] = ['info', 'low', 'medium', 'high', 'critical']

const events = useEventsStore()
const timeseries = useTimeseriesStore()
const filters = useFiltersStore()
const theme = useChartTheme()
const reducedMotion = usePrefersReducedMotion()

const chartType = ref<ChartType>('area')

const bucketsSnapshot = useThrottledRef(() => timeseries.buckets, 1500)

const hasData = computed(() => events.bufferSize > 0)

const option = computed<EChartsOption>(() => {
  const t = theme.value
  const all = bucketsSnapshot.value
  const buckets = all.slice(Math.max(0, all.length - filters.timeRangeSec))
  const visible = SEVERITY_ORDER.filter((s) => filters.activeSeverities.has(s))

  const series = visible.map((sev) => {
    const base = {
      name: sev,
      stack: 'severity',
      data: buckets.map((b) => [b.t * 1000, b.counts[sev]]),
      emphasis: { focus: 'series' as const },
    }
    if (chartType.value === 'bar') {
      return {
        ...base,
        type: 'bar' as const,
        itemStyle: { color: t.severity[sev] },
        barMaxWidth: 6,
      }
    }
    return {
      ...base,
      type: 'line' as const,
      smooth: false,
      showSymbol: false,
      lineStyle: { width: 0 },
      areaStyle: { color: t.severity[sev], opacity: 0.8 },
    }
  })

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
  <div class="flex h-full flex-col p-4">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-sm font-semibold">Severity mix</p>
        <p class="text-xs text-muted">
          stacked by severity · last {{ TIME_RANGE_LABEL[filters.timeRangeSec] }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <ChartTypePicker
          :type="chartType"
          :options="TYPES"
          @update:type="(v) => (chartType = v)"
        />
        <HugeiconsIcon :icon="ChartAreaIcon" :size="18" class="text-muted" />
      </div>
    </div>
    <div class="mt-3 min-h-0 flex-1">
      <VChart v-if="hasData" :option="option" autoresize class="h-full w-full" />
      <ChartSkeleton v-else />
    </div>
  </div>
</template>
