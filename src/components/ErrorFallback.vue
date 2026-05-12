<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue'
import { Alert01Icon } from '@hugeicons/core-free-icons'
import BaseCard from '@/components/BaseCard.vue'
import BaseButton from '@/components/BaseButton.vue'

defineProps<{ error: Error }>()

function reload() {
  window.location.reload()
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-bg p-6">
    <BaseCard class="w-full max-w-md">
      <div class="space-y-4 p-6">
        <div class="flex items-center gap-3">
          <span
            class="flex h-9 w-9 items-center justify-center rounded-full bg-severity-critical/15"
          >
            <HugeiconsIcon :icon="Alert01Icon" :size="20" class="text-severity-critical" />
          </span>
          <div>
            <h2 class="text-lg font-semibold">Something broke</h2>
            <p class="text-xs text-muted">The dashboard hit an unrecoverable render error.</p>
          </div>
        </div>
        <pre
          class="max-h-40 overflow-auto rounded-md border bg-surface-2 p-3 font-mono text-[11px] text-muted"
        >{{ error.message }}</pre>
        <div class="flex justify-end">
          <BaseButton variant="primary" @click="reload">Reload</BaseButton>
        </div>
      </div>
    </BaseCard>
  </div>
</template>
