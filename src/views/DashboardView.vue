<script setup lang="ts">
import { onMounted, provide } from 'vue'
import AppShell from '@/components/layout/AppShell.vue'
import DashboardOverview from '@/components/dashboard/DashboardOverview.vue'
import { useStreamConnection, streamKey } from '@/composables/useStreamConnection'

const stream = useStreamConnection()
provide(streamKey, stream)

onMounted(() => {
  stream.start()
})
</script>

<template>
  <AppShell>
    <DashboardOverview />
  </AppShell>
</template>
