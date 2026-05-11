<script setup lang="ts">
import ThemeToggle from '@/components/ThemeToggle.vue'
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
            class="absolute inset-0 inline-flex h-full w-full animate-ping rounded-full bg-severity-low opacity-75"
          />
          <span class="relative inline-flex h-2 w-2 rounded-full bg-severity-low" />
        </span>
        <span>Live</span>
      </div>
      <ThemeToggle />
    </div>
  </header>
</template>
