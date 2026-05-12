<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { HugeiconsIcon } from '@hugeicons/vue'
import {
  Chart01Icon,
  ChartAreaIcon,
  Activity01Icon,
  GridViewIcon,
} from '@hugeicons/core-free-icons'
import BaseCard from '@/components/BaseCard.vue'
import BaseBadge from '@/components/BaseBadge.vue'
import ControlsBar from '@/components/dashboard/ControlsBar.vue'
import TopSourceCountries from '@/components/charts/TopSourceCountries.vue'
import ActivityFeed from '@/components/feed/ActivityFeed.vue'
import { useConnectionStore } from '@/stores/connection'
import { useEventsStore } from '@/stores/events'
import { useMetricsStore } from '@/stores/metrics'

// ECharts-backed charts are lazy-loaded so the engine (~200 kB gz) sits in its
// own chunk and doesn't block initial paint.
const EventRateChart = defineAsyncComponent(
  () => import('@/components/charts/EventRateChart.vue'),
)
const SeverityMixChart = defineAsyncComponent(
  () => import('@/components/charts/SeverityMixChart.vue'),
)
const TopCategoriesChart = defineAsyncComponent(
  () => import('@/components/charts/TopCategoriesChart.vue'),
)
const CategoryHeatmap = defineAsyncComponent(
  () => import('@/components/charts/CategoryHeatmap.vue'),
)

const connection = useConnectionStore()
const events = useEventsStore()
const metrics = useMetricsStore()

const eventsPerSec = computed(() => metrics.eventsPerSecond.toFixed(1))
const blockedPct = computed(() => `${Math.round(metrics.blockedRate * 100)}%`)
const totalText = computed(() => events.totalIngested.toLocaleString())

const streamBadge = computed(() => {
  if (connection.state === 'connected') return { variant: 'low' as const, label: 'Stream live' }
  if (connection.state === 'paused') return { variant: 'medium' as const, label: 'Stream paused' }
  if (connection.state === 'connecting')
    return { variant: 'info' as const, label: 'Stream connecting' }
  if (connection.state === 'disconnected')
    return { variant: 'critical' as const, label: 'Stream offline' }
  return { variant: 'neutral' as const, label: 'Stream idle' }
})
</script>

<template>
  <div class="space-y-6 p-4 md:p-6">
    <ControlsBar />

    <section id="overview" class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold">Overview</h2>
          <p class="text-xs text-muted">
            {{ totalText }} events ingested · buffer {{ events.bufferSize }} /
            {{ events.MAX_EVENTS }}
          </p>
        </div>
        <BaseBadge :variant="streamBadge.variant" dot>{{ streamBadge.label }}</BaseBadge>
      </div>

      <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
        <BaseCard>
          <div class="p-4">
            <p class="text-[11px] uppercase tracking-[0.18em] text-muted">Events / sec</p>
            <p class="mt-2 font-mono text-2xl font-semibold tracking-tight tabular-nums">
              {{ eventsPerSec }}
            </p>
            <p class="mt-1 text-xs text-muted">5s rolling window</p>
          </div>
        </BaseCard>
        <BaseCard>
          <div class="p-4">
            <p class="text-[11px] uppercase tracking-[0.18em] text-muted">Critical alerts</p>
            <p class="mt-2 font-mono text-2xl font-semibold tracking-tight tabular-nums">
              {{ metrics.criticalCount }}
            </p>
            <p class="mt-1 text-xs text-muted">in current buffer</p>
          </div>
        </BaseCard>
        <BaseCard>
          <div class="p-4">
            <p class="text-[11px] uppercase tracking-[0.18em] text-muted">Blocked / mitigated</p>
            <p class="mt-2 font-mono text-2xl font-semibold tracking-tight tabular-nums">
              {{ blockedPct }}
            </p>
            <p class="mt-1 text-xs text-muted">of ingested events</p>
          </div>
        </BaseCard>
        <BaseCard>
          <div class="p-4">
            <p class="text-[11px] uppercase tracking-[0.18em] text-muted">Throughput</p>
            <p class="mt-2 font-mono text-2xl font-semibold tracking-tight tabular-nums">
              {{ connection.throughput }}
            </p>
            <p class="mt-1 text-xs text-muted">events / sec target</p>
          </div>
        </BaseCard>
      </div>
    </section>

    <section id="threats" class="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
      <BaseCard>
        <div class="flex h-70 flex-col p-4">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-semibold">Event rate</p>
              <p class="text-xs text-muted">events / second · last 2 min</p>
            </div>
            <HugeiconsIcon :icon="Chart01Icon" :size="18" class="text-muted" />
          </div>
          <div class="mt-3 min-h-0 flex-1">
            <EventRateChart />
          </div>
        </div>
      </BaseCard>

      <BaseCard>
        <div class="flex h-70 flex-col p-4">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-semibold">Severity mix</p>
              <p class="text-xs text-muted">stacked by severity · last 2 min</p>
            </div>
            <HugeiconsIcon :icon="ChartAreaIcon" :size="18" class="text-muted" />
          </div>
          <div class="mt-3 min-h-0 flex-1">
            <SeverityMixChart />
          </div>
        </div>
      </BaseCard>

      <BaseCard class="lg:col-span-2 xl:col-span-1">
        <div class="flex h-70 flex-col p-4">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-semibold">Top categories</p>
              <p class="text-xs text-muted">attack types in current buffer</p>
            </div>
            <HugeiconsIcon :icon="Activity01Icon" :size="18" class="text-muted" />
          </div>
          <div class="mt-3 min-h-0 flex-1">
            <TopCategoriesChart />
          </div>
        </div>
      </BaseCard>
    </section>

    <section id="activity" class="grid grid-cols-1 gap-3 lg:grid-cols-3">
      <BaseCard class="lg:col-span-2">
        <div class="h-130">
          <ActivityFeed />
        </div>
      </BaseCard>

      <BaseCard>
        <div class="h-130">
          <TopSourceCountries />
        </div>
      </BaseCard>
    </section>

    <section id="patterns" class="space-y-3">
      <BaseCard>
        <div class="flex h-80 flex-col p-4">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-semibold">Activity heatmap</p>
              <p class="text-xs text-muted">
                events per category in 5-minute buckets · last hour
              </p>
            </div>
            <HugeiconsIcon :icon="GridViewIcon" :size="18" class="text-muted" />
          </div>
          <div class="mt-3 min-h-0 flex-1">
            <CategoryHeatmap />
          </div>
        </div>
      </BaseCard>
    </section>
  </div>
</template>
