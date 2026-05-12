<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue'
import { Shield02Icon } from '@hugeicons/core-free-icons'
import { NAV_ITEMS } from '@/lib/navigation'
</script>

<template>
  <aside
    class="hidden shrink-0 flex-col border-r bg-surface/60 backdrop-blur md:flex md:w-60 lg:w-64"
    aria-label="Primary navigation"
  >
    <div class="flex h-14 items-center gap-2 border-b px-5">
      <HugeiconsIcon :icon="Shield02Icon" :size="22" class="text-accent" />
      <span class="font-semibold tracking-tight">Veloris</span>
    </div>
    <nav class="flex-1 space-y-1 px-3 py-4">
      <a
        v-for="item in NAV_ITEMS"
        :key="item.id"
        :href="item.href"
        class="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:bg-surface-2 focus-visible:text-text focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
      >
        <HugeiconsIcon :icon="item.icon" :size="18" />
        <span>{{ item.label }}</span>
      </a>
    </nav>
    <div class="border-t px-5 py-4 text-[11px] tracking-[0.18em] text-muted uppercase">
      Stage 10 · Polish
    </div>
  </aside>
</template>
