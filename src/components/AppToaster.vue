<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue'
import { Alert01Icon, Cancel01Icon, InformationCircleIcon } from '@hugeicons/core-free-icons'
import { useToastsStore, type ToastVariant } from '@/stores/toasts'

const toasts = useToastsStore()

const VARIANT: Record<ToastVariant, { ring: string; icon: typeof Alert01Icon; iconClass: string }> = {
  info: {
    ring: 'border-l-4 border-l-severity-info',
    icon: InformationCircleIcon,
    iconClass: 'text-severity-info',
  },
  success: {
    ring: 'border-l-4 border-l-severity-low',
    icon: InformationCircleIcon,
    iconClass: 'text-severity-low',
  },
  warning: {
    ring: 'border-l-4 border-l-severity-medium',
    icon: Alert01Icon,
    iconClass: 'text-severity-medium',
  },
  critical: {
    ring: 'border-l-4 border-l-severity-critical',
    icon: Alert01Icon,
    iconClass: 'text-severity-critical',
  },
}
</script>

<template>
  <TransitionGroup
    tag="div"
    enter-active-class="transition transform duration-200 ease-out"
    enter-from-class="opacity-0 translate-x-6"
    enter-to-class="opacity-100 translate-x-0"
    leave-active-class="transition transform duration-200 ease-in absolute right-0"
    leave-from-class="opacity-100 translate-x-0"
    leave-to-class="opacity-0 translate-x-6"
    class="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2"
    role="region"
    aria-label="Notifications"
    aria-live="polite"
  >
    <div
      v-for="toast in toasts.list"
      :key="toast.id"
      class="pointer-events-auto relative flex items-start gap-3 rounded-lg border bg-surface px-3 py-3 shadow-lg backdrop-blur"
      :class="VARIANT[toast.variant].ring"
      :role="toast.variant === 'critical' ? 'alert' : 'status'"
    >
      <HugeiconsIcon
        :icon="VARIANT[toast.variant].icon"
        :size="18"
        :class="['mt-0.5 shrink-0', VARIANT[toast.variant].iconClass]"
      />
      <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold">{{ toast.title }}</p>
        <p v-if="toast.description" class="mt-0.5 text-xs text-muted">
          {{ toast.description }}
        </p>
      </div>
      <button
        type="button"
        class="shrink-0 rounded p-1 text-muted transition-colors hover:bg-surface-2 hover:text-text"
        aria-label="Dismiss"
        @click="toasts.dismiss(toast.id)"
      >
        <HugeiconsIcon :icon="Cancel01Icon" :size="14" />
      </button>
    </div>
  </TransitionGroup>
</template>
