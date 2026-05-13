<script setup lang="ts">
import { RouterLink } from 'vue-router'
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from 'reka-ui'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Cancel01Icon, Shield02Icon } from '@hugeicons/core-free-icons'
import { NAV_ITEMS } from '@/lib/navigation'

const { open } = defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [boolean] }>()

function close() {
  emit('update:open', false)
}
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in"
      />
      <DialogContent
        class="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r bg-surface shadow-2xl outline-hidden data-[state=closed]:animate-slide-out-left data-[state=open]:animate-slide-in-left"
        aria-label="Primary navigation"
      >
        <div class="flex h-14 items-center justify-between border-b px-5">
          <RouterLink
            to="/"
            class="flex items-center gap-2 focus-visible:outline-hidden"
            @click="close"
          >
            <HugeiconsIcon :icon="Shield02Icon" :size="22" class="text-accent" />
            <DialogTitle class="font-semibold tracking-tight">Veloris</DialogTitle>
          </RouterLink>
          <DialogClose
            class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Close navigation"
          >
            <HugeiconsIcon :icon="Cancel01Icon" :size="18" />
          </DialogClose>
        </div>

        <DialogDescription class="sr-only">
          Navigate between dashboard sections.
        </DialogDescription>

        <nav class="flex-1 space-y-1 px-3 py-4">
          <a
            v-for="item in NAV_ITEMS"
            :key="item.id"
            :href="item.href"
            class="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:bg-surface-2 focus-visible:text-text focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
            @click="close"
          >
            <HugeiconsIcon :icon="item.icon" :size="18" />
            <span>{{ item.label }}</span>
          </a>
        </nav>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
