<script setup lang="ts">
withDefaults(defineProps<{ label?: string }>(), {
  label: 'Waiting for stream…',
})
</script>

<template>
  <div
    class="relative flex h-full w-full items-center justify-center overflow-hidden rounded-md border border-dashed border-border/70 bg-surface-2/40"
    role="status"
    :aria-label="label"
  >
    <div
      class="pointer-events-none absolute inset-y-0 -left-full w-full animate-shimmer bg-gradient-to-r from-transparent via-accent/10 to-transparent"
    />
    <p class="relative text-xs text-muted">{{ label }}</p>
  </div>
</template>
