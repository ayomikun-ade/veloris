<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, provide } from 'vue'
import AppShell from '@/components/layout/AppShell.vue'
import DashboardOverview from '@/components/dashboard/DashboardOverview.vue'
import { useStreamConnection, streamKey } from '@/composables/useStreamConnection'

const PerfOverlay = defineAsyncComponent(() => import('@/components/PerfOverlay.vue'))

const stream = useStreamConnection()
provide(streamKey, stream)

const perfEnabled = computed(() => {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).has('perf')
})

onMounted(() => {
  stream.start()
})
</script>

<template>
  <AppShell>
    <DashboardOverview />
  </AppShell>
  <PerfOverlay v-if="perfEnabled" />
</template>
