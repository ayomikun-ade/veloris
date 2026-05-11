<script setup lang="ts">
import { computed } from 'vue'
import { useEventsStore } from '@/stores/events'
import { useFiltersStore } from '@/stores/filters'
import { countryFlag, countryName } from '@/lib/countryFlag'

const TOP_N = 8

const events = useEventsStore()
const filters = useFiltersStore()

const topCountries = computed(() => {
  const active = filters.activeSeverities
  const counts = new Map<string, number>()
  for (const ev of events.events) {
    if (!active.has(ev.severity)) continue
    counts.set(ev.sourceCountry, (counts.get(ev.sourceCountry) ?? 0) + 1)
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, TOP_N)
  const max = sorted[0]?.[1] ?? 0
  return sorted.map(([code, count]) => ({
    code,
    count,
    name: countryName(code),
    flag: countryFlag(code),
    pct: max === 0 ? 0 : Math.round((count / max) * 100),
  }))
})
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="flex items-start justify-between px-4 pt-4">
      <div>
        <p class="text-sm font-semibold">Top source countries</p>
        <p class="text-xs text-muted">Origins in current buffer</p>
      </div>
      <span class="text-xs text-muted">{{ topCountries.length }} / {{ TOP_N }}</span>
    </div>

    <div class="min-h-0 flex-1 overflow-auto px-4 py-3">
      <div v-if="topCountries.length > 0" class="space-y-2.5">
        <div v-for="entry in topCountries" :key="entry.code" class="space-y-1">
          <div class="flex items-center gap-2 text-sm">
            <span class="text-base leading-none">{{ entry.flag }}</span>
            <span class="min-w-0 flex-1 truncate">{{ entry.name }}</span>
            <span class="font-mono text-xs tabular-nums text-muted">
              {{ entry.count.toLocaleString() }}
            </span>
          </div>
          <div class="h-1 overflow-hidden rounded-full bg-surface-2">
            <div
              class="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
              :style="{ width: `${entry.pct}%` }"
            />
          </div>
        </div>
      </div>

      <div
        v-else
        class="flex h-full items-center justify-center px-6 text-center text-xs text-muted"
      >
        Waiting for events…
      </div>
    </div>
  </div>
</template>
