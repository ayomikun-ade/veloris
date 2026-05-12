<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue'
import {
  PauseIcon,
  PlayIcon,
  Unlink02Icon,
  VolumeHighIcon,
  VolumeMute01Icon,
} from '@hugeicons/core-free-icons'
import BaseButton from '@/components/BaseButton.vue'
import { SEVERITIES, type Severity } from '@/types/event'
import { useConnectionStore } from '@/stores/connection'
import { useFiltersStore } from '@/stores/filters'
import { useToastsStore } from '@/stores/toasts'
import { useStream } from '@/composables/useStreamConnection'

const connection = useConnectionStore()
const filters = useFiltersStore()
const toasts = useToastsStore()
const stream = useStream()

function togglePause() {
  if (connection.isPaused) stream.resume()
  else stream.pause()
}

function onThroughputInput(e: Event) {
  const v = Number((e.target as HTMLInputElement).value)
  stream.setThroughput(v)
}

function toggleSound() {
  toasts.setSoundEnabled(!toasts.soundEnabled)
}

const SEVERITY_DOT: Record<Severity, string> = {
  info: 'bg-severity-info',
  low: 'bg-severity-low',
  medium: 'bg-severity-medium',
  high: 'bg-severity-high',
  critical: 'bg-severity-critical',
}

const SEVERITY_LABEL: Record<Severity, string> = {
  info: 'Info',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}
</script>

<template>
  <div
    class="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-lg border bg-surface/60 px-3 py-2.5 backdrop-blur"
  >
    <div class="flex items-center gap-2">
      <BaseButton
        variant="secondary"
        size="sm"
        :disabled="connection.isDisconnected"
        :aria-label="connection.isPaused ? 'Resume stream' : 'Pause stream'"
        @click="togglePause"
      >
        <HugeiconsIcon :icon="connection.isPaused ? PlayIcon : PauseIcon" :size="14" />
        <span class="hidden sm:inline">{{ connection.isPaused ? 'Resume' : 'Pause' }}</span>
      </BaseButton>

      <BaseButton
        variant="ghost"
        size="icon"
        :disabled="connection.isDisconnected"
        aria-label="Simulate disconnect"
        title="Simulate a worker disconnect (tests reconnect logic)"
        @click="stream.simulateDisconnect()"
      >
        <HugeiconsIcon :icon="Unlink02Icon" :size="14" />
      </BaseButton>

      <label class="flex items-center gap-2 text-xs">
        <span class="hidden text-muted sm:inline">Rate</span>
        <input
          type="range"
          min="1"
          max="200"
          step="1"
          :value="connection.throughput"
          class="h-1.5 w-28 cursor-pointer appearance-none rounded-full bg-surface-2 accent-accent md:w-36"
          aria-label="Throughput in events per second"
          @input="onThroughputInput"
        />
        <span class="w-8 text-right font-mono tabular-nums">{{ connection.throughput }}</span>
        <span class="text-muted">/s</span>
      </label>
    </div>

    <div class="hidden h-6 w-px bg-border sm:block" />

    <div class="flex flex-wrap items-center gap-1.5">
      <span class="text-[11px] uppercase tracking-[0.18em] text-muted">Severity</span>
      <button
        v-for="sev in SEVERITIES"
        :key="sev"
        type="button"
        :aria-pressed="filters.activeSeverities.has(sev)"
        :class="[
          'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors',
          filters.activeSeverities.has(sev)
            ? 'bg-surface-2 text-text'
            : 'border-transparent text-muted hover:bg-surface-2',
        ]"
        @click="filters.toggleSeverity(sev)"
      >
        <span :class="['h-1.5 w-1.5 rounded-full', SEVERITY_DOT[sev]]" />
        {{ SEVERITY_LABEL[sev] }}
      </button>
    </div>

    <div class="ml-auto flex items-center gap-2">
      <BaseButton
        variant="ghost"
        size="icon"
        :aria-pressed="toasts.soundEnabled"
        :aria-label="toasts.soundEnabled ? 'Mute critical alert sounds' : 'Enable critical alert sounds'"
        :title="toasts.soundEnabled ? 'Mute alerts' : 'Enable alert sound'"
        @click="toggleSound"
      >
        <HugeiconsIcon
          :icon="toasts.soundEnabled ? VolumeHighIcon : VolumeMute01Icon"
          :size="14"
          :class="toasts.soundEnabled ? 'text-accent' : ''"
        />
      </BaseButton>

      <div class="flex items-center gap-2">
        <span class="text-[11px] uppercase tracking-[0.18em] text-muted">Window</span>
        <div class="inline-flex rounded-md border bg-surface-2 p-0.5">
          <button
            v-for="opt in filters.TIME_RANGE_OPTIONS"
            :key="opt"
            type="button"
            :class="[
              'rounded px-2 py-1 text-xs font-medium transition-colors',
              filters.timeRangeSec === opt
                ? 'bg-accent text-on-accent'
                : 'text-muted hover:text-text',
            ]"
            @click="filters.setTimeRange(opt)"
          >
            {{ filters.TIME_RANGE_LABEL[opt] }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
