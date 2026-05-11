<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue'
import {
  Chart01Icon,
  ChartAreaIcon,
  Activity01Icon,
  Globe02Icon,
} from '@hugeicons/core-free-icons'
import BaseCard from '@/components/BaseCard.vue'
import BaseBadge from '@/components/BaseBadge.vue'

const metrics = [
  { id: 'events', label: 'Events / sec', value: '—', trend: 'awaiting stream' },
  { id: 'critical', label: 'Critical alerts', value: '—', trend: 'awaiting stream' },
  { id: 'blocked', label: 'Blocked', value: '—', trend: 'awaiting stream' },
  { id: 'mttr', label: 'Avg. mitigation', value: '—', trend: 'awaiting stream' },
]

const chartSlots = [
  { id: 'rate', title: 'Event rate', subtitle: 'events / second over time', icon: Chart01Icon },
  {
    id: 'severity',
    title: 'Severity mix',
    subtitle: 'stacked area by severity',
    icon: ChartAreaIcon,
  },
  {
    id: 'categories',
    title: 'Top categories',
    subtitle: 'attack types in window',
    icon: Activity01Icon,
  },
]
</script>

<template>
  <div class="space-y-6 p-4 md:p-6">
    <section id="overview" class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold">Overview</h2>
          <p class="text-xs text-muted">
            Live threat operations — placeholder until Stage 3 wires the stream.
          </p>
        </div>
        <BaseBadge variant="accent" dot>Stream not connected</BaseBadge>
      </div>

      <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
        <BaseCard v-for="m in metrics" :key="m.id">
          <div class="p-4">
            <p class="text-[11px] uppercase tracking-[0.18em] text-muted">{{ m.label }}</p>
            <p class="mt-2 font-mono text-2xl font-semibold tracking-tight">{{ m.value }}</p>
            <p class="mt-1 text-xs text-muted">{{ m.trend }}</p>
          </div>
        </BaseCard>
      </div>
    </section>

    <section id="threats" class="grid grid-cols-1 gap-3 lg:grid-cols-3">
      <BaseCard v-for="c in chartSlots" :key="c.id">
        <div class="flex min-h-[240px] flex-col p-4">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-semibold">{{ c.title }}</p>
              <p class="text-xs text-muted">{{ c.subtitle }}</p>
            </div>
            <HugeiconsIcon :icon="c.icon" :size="18" class="text-muted" />
          </div>
          <div
            class="mt-4 flex flex-1 items-center justify-center rounded-md border border-dashed border-border/70 bg-surface-2/40 text-xs text-muted"
          >
            Awaiting stream
          </div>
        </div>
      </BaseCard>
    </section>

    <section id="activity" class="grid grid-cols-1 gap-3 lg:grid-cols-3">
      <BaseCard class="lg:col-span-2">
        <div class="flex min-h-[280px] flex-col p-4">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-semibold">Activity feed</p>
              <p class="text-xs text-muted">Live event log — newest first</p>
            </div>
            <HugeiconsIcon :icon="Activity01Icon" :size="18" class="text-muted" />
          </div>
          <div
            class="mt-4 flex flex-1 items-center justify-center rounded-md border border-dashed border-border/70 bg-surface-2/40 text-xs text-muted"
          >
            Awaiting stream
          </div>
        </div>
      </BaseCard>

      <BaseCard>
        <div class="flex min-h-[280px] flex-col p-4">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-semibold">Geographic origins</p>
              <p class="text-xs text-muted">Attack sources worldwide</p>
            </div>
            <HugeiconsIcon :icon="Globe02Icon" :size="18" class="text-muted" />
          </div>
          <div
            class="mt-4 flex flex-1 items-center justify-center rounded-md border border-dashed border-border/70 bg-surface-2/40 text-xs text-muted"
          >
            Geo map lands in Stage 7
          </div>
        </div>
      </BaseCard>
    </section>
  </div>
</template>
