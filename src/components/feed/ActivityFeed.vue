<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { useVirtualizer } from '@tanstack/vue-virtual'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Activity01Icon, Search01Icon, Cancel01Icon } from '@hugeicons/core-free-icons'
import BaseBadge from '@/components/BaseBadge.vue'
import EventDetailDrawer from '@/components/feed/EventDetailDrawer.vue'
import type { Severity, Status, ThreatEvent } from '@/types/event'
import { useEventsStore } from '@/stores/events'
import { useFiltersStore } from '@/stores/filters'
import { useNow } from '@/composables/useNow'
import { formatRelativeTime } from '@/lib/format'

const events = useEventsStore()
const filters = useFiltersStore()
const now = useNow()

const filtered = computed<ThreatEvent[]>(() => {
  const buf = events.events
  const active = filters.activeSeverities
  const q = filters.search.trim().toLowerCase()
  // Always produce a new array. The events store mutates its shallowRef-backed
  // buffer in place and calls triggerRef, so handing back the same reference
  // here would make Vue's computed identity-check skip downstream updates and
  // vue-virtual's count getter would never re-read.
  const result: ThreatEvent[] = []
  for (const ev of buf) {
    if (!active.has(ev.severity)) continue
    if (q.length > 0) {
      const hay = `${ev.sourceIp} ${ev.targetAsset} ${ev.description} ${ev.category}`.toLowerCase()
      if (!hay.includes(q)) continue
    }
    result.push(ev)
  }
  return result
})

const scrollEl = useTemplateRef<HTMLDivElement>('scrollEl')

const rowVirtualizer = useVirtualizer({
  get count() {
    return filtered.value.length
  },
  getScrollElement: () => scrollEl.value,
  estimateSize: () => 56,
  overscan: 8,
})

const selectedEvent = ref<ThreatEvent | null>(null)

function selectByIndex(index: number) {
  selectedEvent.value = filtered.value[index] ?? null
}

function closeDrawer(open: boolean) {
  if (!open) selectedEvent.value = null
}

const SEVERITY_DOT: Record<Severity, string> = {
  info: 'bg-severity-info',
  low: 'bg-severity-low',
  medium: 'bg-severity-medium',
  high: 'bg-severity-high',
  critical: 'bg-severity-critical',
}

const STATUS_VARIANT: Record<Status, 'low' | 'info' | 'medium' | 'high'> = {
  blocked: 'low',
  mitigated: 'info',
  investigating: 'medium',
  allowed: 'high',
}
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="flex items-start justify-between px-4 pt-4">
      <div>
        <p class="text-sm font-semibold">Activity feed</p>
        <p class="text-xs text-muted">
          {{ filtered.length.toLocaleString() }}
          <template v-if="filtered.length !== events.bufferSize">
            of {{ events.bufferSize.toLocaleString() }}
          </template>
          events · newest first
        </p>
      </div>
      <HugeiconsIcon :icon="Activity01Icon" :size="18" class="text-muted" />
    </div>

    <div class="px-4 pt-3 pb-2">
      <div class="relative">
        <span class="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-muted">
          <HugeiconsIcon :icon="Search01Icon" :size="14" />
        </span>
        <input
          v-model="filters.search"
          type="search"
          placeholder="Search IP, asset, description, category…"
          class="w-full rounded-md border bg-surface-2 py-1.5 pr-8 pl-8 text-sm placeholder:text-muted focus:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
        />
        <button
          v-if="!filters.isDefault"
          type="button"
          class="absolute inset-y-0 right-1 inline-flex items-center rounded p-1 text-muted transition-colors hover:bg-surface hover:text-text"
          aria-label="Clear filters"
          @click="filters.clear"
        >
          <HugeiconsIcon :icon="Cancel01Icon" :size="14" />
        </button>
      </div>
    </div>

    <div ref="scrollEl" class="min-h-0 flex-1 overflow-auto border-t">
      <div
        v-if="filtered.length > 0"
        class="relative"
        :style="{ height: `${rowVirtualizer.getTotalSize()}px` }"
      >
        <button
          v-for="virtualRow in rowVirtualizer.getVirtualItems()"
          :key="filtered[virtualRow.index].id"
          type="button"
          class="absolute inset-x-0 top-0 flex items-center gap-3 px-4 text-left transition-colors hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-hidden"
          :style="{
            height: `${virtualRow.size}px`,
            transform: `translateY(${virtualRow.start}px)`,
          }"
          @click="selectByIndex(virtualRow.index)"
        >
          <span
            :class="[
              'size-2 shrink-0 rounded-full',
              SEVERITY_DOT[filtered[virtualRow.index].severity],
            ]"
          />
          <span class="w-14 shrink-0 font-mono text-[11px] tabular-nums text-muted">
            {{ formatRelativeTime(filtered[virtualRow.index].timestamp, now) }}
          </span>
          <span class="min-w-0 flex-1 truncate text-sm">
            {{ filtered[virtualRow.index].description }}
          </span>
          <span class="hidden w-56 truncate font-mono text-[11px] text-muted md:inline">
            {{ filtered[virtualRow.index].sourceIp }} →
            {{ filtered[virtualRow.index].targetAsset }}
          </span>
          <BaseBadge
            :variant="STATUS_VARIANT[filtered[virtualRow.index].status]"
            class="shrink-0"
          >
            {{ filtered[virtualRow.index].status }}
          </BaseBadge>
        </button>
      </div>

      <div
        v-else
        class="flex h-full items-center justify-center px-6 text-center text-xs text-muted"
      >
        <template v-if="events.bufferSize === 0">Waiting for first events…</template>
        <template v-else>No events match the current filters.</template>
      </div>
    </div>

    <EventDetailDrawer :event="selectedEvent" @update:open="closeDrawer" />
  </div>
</template>
