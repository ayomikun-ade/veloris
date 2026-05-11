<script setup lang="ts">
import { computed } from 'vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useConnectionStore, type ConnectionState } from '@/stores/connection'

const connection = useConnectionStore()

const LABELS: Record<ConnectionState, string> = {
  idle: 'Idle',
  connecting: 'Connecting',
  connected: 'Live',
  paused: 'Paused',
  disconnected: 'Offline',
}

const DOT_CLASS: Record<ConnectionState, string> = {
  idle: 'bg-muted',
  connecting: 'bg-severity-info',
  connected: 'bg-severity-low',
  paused: 'bg-severity-medium',
  disconnected: 'bg-severity-critical',
}

const PING_CLASS: Record<ConnectionState, string> = {
  idle: '',
  connecting: 'bg-severity-info',
  connected: 'bg-severity-low',
  paused: '',
  disconnected: '',
}

const showPing = computed(() => PING_CLASS[connection.state] !== '')
</script>

<template>
  <header
    class="flex h-14 items-center justify-between border-b bg-surface/60 px-4 backdrop-blur md:px-6"
  >
    <div class="flex items-center gap-3">
      <h1 class="text-sm font-semibold tracking-tight">Overview</h1>
      <span class="hidden text-xs text-muted sm:inline">Real-time threat operations</span>
    </div>
    <div class="flex items-center gap-3">
      <div
        class="hidden items-center gap-2 rounded-md border bg-surface-2 px-2.5 py-1 text-xs font-medium sm:flex"
      >
        <span class="relative flex h-2 w-2">
          <span
            v-if="showPing"
            :class="[
              'absolute inset-0 inline-flex h-full w-full animate-ping rounded-full opacity-75',
              PING_CLASS[connection.state],
            ]"
          />
          <span
            :class="['relative inline-flex h-2 w-2 rounded-full', DOT_CLASS[connection.state]]"
          />
        </span>
        <span>{{ LABELS[connection.state] }}</span>
      </div>
      <ThemeToggle />
    </div>
  </header>
</template>
