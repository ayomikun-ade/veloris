<script setup lang="ts">
import { computed, ref } from 'vue'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Activity01Icon } from '@hugeicons/core-free-icons'
import '@/lib/echarts'
import type { Category } from '@/types/event'
import { useEventsStore } from '@/stores/events'
import { useFiltersStore } from '@/stores/filters'
import { useChartTheme } from '@/composables/useChartTheme'
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import ChartSkeleton from '@/components/ChartSkeleton.vue'
import ChartTypePicker from '@/components/ChartTypePicker.vue'

const TOP_N = 8

type ChartType = 'horizontal' | 'vertical'
const TYPES = [
  { value: 'horizontal', label: 'Horiz.' },
  { value: 'vertical', label: 'Vert.' },
] as const satisfies ReadonlyArray<{ value: ChartType; label: string }>

const events = useEventsStore()
const filters = useFiltersStore()
const theme = useChartTheme()
const reducedMotion = usePrefersReducedMotion()

const chartType = ref<ChartType>('horizontal')

const hasData = computed(() => events.bufferSize > 0)

const option = computed<EChartsOption>(() => {
  const t = theme.value
  const active = filters.activeSeverities
  const counts = new Map<Category, number>()
  for (const ev of events.events) {
    if (!active.has(ev.severity)) continue
    counts.set(ev.category, (counts.get(ev.category) ?? 0) + 1)
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, TOP_N)

  const isHorizontal = chartType.value === 'horizontal'

  // For horizontal bars, ECharts renders categories bottom→top, so reverse to
  // put the highest value at the top. For vertical bars, keep highest on the left.
  const names = isHorizontal ? sorted.map(([n]) => n).reverse() : sorted.map(([n]) => n)
  const values = isHorizontal ? sorted.map(([, c]) => c).reverse() : sorted.map(([, c]) => c)

  const valueAxis = {
    type: 'value' as const,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: t.muted, fontSize: 10 },
    splitLine: { lineStyle: { color: t.grid } },
    splitNumber: 3,
  }
  const categoryAxis = {
    type: 'category' as const,
    data: names,
    axisLine: { lineStyle: { color: t.border } },
    axisTick: { show: false },
    axisLabel: {
      color: t.muted,
      fontSize: 11,
      ...(isHorizontal ? {} : { rotate: -20, interval: 0 }),
    },
  }

  return {
    animation: !reducedMotion.value,
    animationDurationUpdate: 0,
    aria: { enabled: true },
    grid: isHorizontal
      ? { left: 110, right: 28, top: 8, bottom: 22, containLabel: false }
      : { left: 36, right: 12, top: 14, bottom: 56, containLabel: false },
    xAxis: isHorizontal ? valueAxis : categoryAxis,
    yAxis: isHorizontal ? categoryAxis : valueAxis,
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
        itemStyle: {
          color: t.accent,
          borderRadius: isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
        },
        barMaxWidth: 14,
        label: {
          show: true,
          position: isHorizontal ? 'right' : 'top',
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
  <div class="flex h-full flex-col p-4">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-sm font-semibold">Top categories</p>
        <p class="text-xs text-muted">attack types in current buffer</p>
      </div>
      <div class="flex items-center gap-2">
        <ChartTypePicker
          :type="chartType"
          :options="TYPES"
          @update:type="(v) => (chartType = v)"
        />
        <HugeiconsIcon :icon="Activity01Icon" :size="18" class="text-muted" />
      </div>
    </div>
    <div class="mt-3 min-h-0 flex-1">
      <VChart v-if="hasData" :option="option" autoresize class="h-full w-full" />
      <ChartSkeleton v-else />
    </div>
  </div>
</template>
