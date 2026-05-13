<script setup lang="ts">
import { computed, defineAsyncComponent, onErrorCaptured, ref } from 'vue'
import { RouterView } from 'vue-router'
import AppToaster from '@/components/AppToaster.vue'
import ErrorFallback from '@/components/ErrorFallback.vue'

const PerfOverlay = defineAsyncComponent(() => import('@/components/PerfOverlay.vue'))

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
</script>

<template>
  <ErrorFallback v-if="fatalError" :error="fatalError" />
  <template v-else>
    <RouterView />
    <AppToaster />
    <PerfOverlay v-if="perfEnabled" />
  </template>
</template>
