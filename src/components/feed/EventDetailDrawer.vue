<script setup lang="ts">
import { computed } from 'vue'
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
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import BaseBadge from '@/components/BaseBadge.vue'
import type { Severity, Status, ThreatEvent } from '@/types/event'
import { formatFullTimestamp } from '@/lib/format'

const { event } = defineProps<{ event: ThreatEvent | null }>()
const emit = defineEmits<{ 'update:open': [boolean] }>()

const isOpen = computed({
  get: () => event !== null,
  set: (v: boolean) => {
    if (!v) emit('update:open', false)
  },
})

const SEVERITY_VARIANT: Record<Severity, 'info' | 'low' | 'medium' | 'high' | 'critical'> = {
  info: 'info',
  low: 'low',
  medium: 'medium',
  high: 'high',
  critical: 'critical',
}

const STATUS_VARIANT: Record<Status, 'low' | 'info' | 'medium' | 'high'> = {
  blocked: 'low',
  mitigated: 'info',
  investigating: 'medium',
  allowed: 'high',
}
</script>

<template>
  <DialogRoot v-model:open="isOpen">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out"
      />
      <DialogContent
        v-if="event"
        class="fixed inset-y-0 right-0 z-50 flex w-[420px] max-w-full flex-col border-l bg-surface shadow-2xl outline-hidden data-[state=open]:animate-slide-in-right data-[state=closed]:animate-slide-out-right"
      >
        <div class="flex items-center justify-between border-b px-5 py-4">
          <div class="flex min-w-0 items-center gap-3">
            <BaseBadge :variant="SEVERITY_VARIANT[event.severity]" dot>
              {{ event.severity }}
            </BaseBadge>
            <DialogTitle class="truncate text-sm font-semibold">
              {{ event.category }}
            </DialogTitle>
          </div>
          <DialogClose
            class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Close"
          >
            <HugeiconsIcon :icon="Cancel01Icon" :size="18" />
          </DialogClose>
        </div>

        <DialogDescription class="sr-only">
          Detailed view of a single threat event.
        </DialogDescription>

        <div class="flex-1 space-y-5 overflow-auto px-5 py-4">
          <p class="text-sm leading-relaxed">{{ event.description }}</p>

          <div class="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p class="text-[11px] uppercase tracking-[0.18em] text-muted">Status</p>
              <BaseBadge :variant="STATUS_VARIANT[event.status]" class="mt-1.5">
                {{ event.status }}
              </BaseBadge>
            </div>
            <div>
              <p class="text-[11px] uppercase tracking-[0.18em] text-muted">Severity</p>
              <BaseBadge :variant="SEVERITY_VARIANT[event.severity]" dot class="mt-1.5">
                {{ event.severity }}
              </BaseBadge>
            </div>
            <div>
              <p class="text-[11px] uppercase tracking-[0.18em] text-muted">Source IP</p>
              <p class="mt-1 font-mono text-sm">{{ event.sourceIp }}</p>
            </div>
            <div>
              <p class="text-[11px] uppercase tracking-[0.18em] text-muted">Country</p>
              <p class="mt-1 font-mono text-sm">{{ event.sourceCountry }}</p>
            </div>
            <div class="col-span-2">
              <p class="text-[11px] uppercase tracking-[0.18em] text-muted">Target asset</p>
              <p class="mt-1 font-mono text-sm">{{ event.targetAsset }}</p>
            </div>
            <div class="col-span-2">
              <p class="text-[11px] uppercase tracking-[0.18em] text-muted">Timestamp</p>
              <p class="mt-1 font-mono text-sm">{{ formatFullTimestamp(event.timestamp) }}</p>
            </div>
            <div class="col-span-2">
              <p class="text-[11px] uppercase tracking-[0.18em] text-muted">Event ID</p>
              <p class="mt-1 break-all font-mono text-xs text-muted">{{ event.id }}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
