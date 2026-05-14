<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import BaseCard from '@/components/BaseCard.vue'
import BaseBadge from '@/components/BaseBadge.vue'
import ControlsBar from '@/components/dashboard/ControlsBar.vue'
import TopSourceCountries from '@/components/charts/TopSourceCountries.vue'
import ActivityFeed from '@/components/feed/ActivityFeed.vue'
import { useConnectionStore } from '@/stores/connection'
import { useEventsStore } from '@/stores/events'
import { useMetricsStore } from '@/stores/metrics'
import { useThrottledRef } from '@/composables/useThrottledRef'

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

// Throttle the displayed metric values so numbers don't twitch at 10 Hz.
// The underlying stores still update at native rate; only the rendered
// readouts breathe at 1.5 s.
const eventsPerSecondRaw = useThrottledRef(() => metrics.eventsPerSecond, 1500)
const criticalCountRaw = useThrottledRef(() => metrics.criticalCount, 1500)
const blockedRateRaw = useThrottledRef(() => metrics.blockedRate, 1500)
const totalIngestedRaw = useThrottledRef(() => events.totalIngested, 1500)
const bufferSizeRaw = useThrottledRef(() => events.bufferSize, 1500)

const eventsPerSec = computed(() => eventsPerSecondRaw.value.toFixed(1))
const criticalCount = computed(() => criticalCountRaw.value)
const blockedPct = computed(() => `${Math.round(blockedRateRaw.value * 100)}%`)
const totalText = computed(() => totalIngestedRaw.value.toLocaleString())
const bufferSize = computed(() => bufferSizeRaw.value)

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
            {{ totalText }} events ingested · buffer {{ bufferSize }} /
            {{ events.MAX_EVENTS }}
          </p>
        </div>
        <BaseBadge :variant="streamBadge.variant" dot>{{ streamBadge.label }}</BaseBadge>
      </div>

      <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
        <BaseCard>
          <div class="p-4">
            <p class="text-[11px] tracking-[0.18em] text-muted uppercase">Events / sec</p>
            <p class="mt-2 font-mono text-2xl font-semibold tracking-tight tabular-nums">
              {{ eventsPerSec }}
            </p>
            <p class="mt-1 text-xs text-muted">5s rolling window</p>
          </div>
        </BaseCard>
        <BaseCard>
          <div class="p-4">
            <p class="text-[11px] tracking-[0.18em] text-muted uppercase">Critical alerts</p>
            <p class="mt-2 font-mono text-2xl font-semibold tracking-tight tabular-nums">
              {{ criticalCount }}
            </p>
            <p class="mt-1 text-xs text-muted">in current buffer</p>
          </div>
        </BaseCard>
        <BaseCard>
          <div class="p-4">
            <p class="text-[11px] tracking-[0.18em] text-muted uppercase">Blocked / mitigated</p>
            <p class="mt-2 font-mono text-2xl font-semibold tracking-tight tabular-nums">
              {{ blockedPct }}
            </p>
            <p class="mt-1 text-xs text-muted">of ingested events</p>
          </div>
        </BaseCard>
        <BaseCard>
          <div class="p-4">
            <p class="text-[11px] tracking-[0.18em] text-muted uppercase">Throughput</p>
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
        <div class="h-70">
          <EventRateChart />
        </div>
      </BaseCard>

      <BaseCard>
        <div class="h-70">
          <SeverityMixChart />
        </div>
      </BaseCard>

      <BaseCard class="lg:col-span-2 xl:col-span-1">
        <div class="h-70">
          <TopCategoriesChart />
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
        <div class="h-80">
          <CategoryHeatmap />
        </div>
      </BaseCard>
    </section>
  </div>
</template>
