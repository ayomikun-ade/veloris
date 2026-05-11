<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue'
import {
  Shield02Icon,
  Activity01Icon,
  Globe02Icon,
  DashboardCircleIcon,
} from '@hugeicons/core-free-icons'

const navItems = [
  { id: 'overview', label: 'Overview', icon: DashboardCircleIcon, href: '#overview' },
  { id: 'threats', label: 'Threats', icon: Globe02Icon, href: '#threats' },
  { id: 'activity', label: 'Activity', icon: Activity01Icon, href: '#activity' },
]
</script>

<template>
  <aside
    class="hidden md:flex md:w-60 lg:w-64 shrink-0 flex-col border-r bg-surface/60 backdrop-blur"
  >
    <div class="flex h-14 items-center gap-2 border-b px-5">
      <HugeiconsIcon :icon="Shield02Icon" :size="22" class="text-accent" />
      <span class="font-semibold tracking-tight">Veloris</span>
    </div>
    <nav class="flex-1 space-y-1 px-3 py-4">
      <a
        v-for="item in navItems"
        :key="item.id"
        :href="item.href"
        class="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-text"
      >
        <HugeiconsIcon :icon="item.icon" :size="18" />
        <span>{{ item.label }}</span>
      </a>
    </nav>
    <div class="border-t px-5 py-4 text-[11px] uppercase tracking-[0.18em] text-muted">
      Stage 2 · Shell
    </div>
  </aside>
</template>
