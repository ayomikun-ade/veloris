<script setup lang="ts">
import { computed, defineAsyncComponent, onErrorCaptured, onMounted, provide, ref } from 'vue'
import AppShell from '@/components/layout/AppShell.vue'
import DashboardOverview from '@/components/dashboard/DashboardOverview.vue'
import AppToaster from '@/components/AppToaster.vue'
import ErrorFallback from '@/components/ErrorFallback.vue'
import { useStreamConnection, streamKey } from '@/composables/useStreamConnection'

const PerfOverlay = defineAsyncComponent(() => import('@/components/PerfOverlay.vue'))

const stream = useStreamConnection()
provide(streamKey, stream)

const perfEnabled = computed(() => {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).has('perf')
})

const fatalError = ref<Error | null>(null)
onErrorCaptured((err) => {
  console.error('Veloris error boundary captured:', err)
  fatalError.value = err instanceof Error ? err : new Error(String(err))
  // Stop propagation — render the fallback instead of letting Vue bubble.
  return false
})

onMounted(() => {
  stream.start()
})
</script>

<template>
  <ErrorFallback v-if="fatalError" :error="fatalError" />
  <template v-else>
    <AppShell>
      <DashboardOverview />
    </AppShell>
    <AppToaster />
    <PerfOverlay v-if="perfEnabled" />
  </template>
</template>
