<script setup lang="ts">
import { onMounted } from 'vue'
import AppShell from '@/components/layout/AppShell.vue'
import DashboardOverview from '@/components/dashboard/DashboardOverview.vue'
import { useStreamConnection } from '@/composables/useStreamConnection'

const stream = useStreamConnection()

onMounted(() => {
  stream.start()
})
</script>

<template>
  <AppShell>
    <DashboardOverview />
  </AppShell>
</template>
