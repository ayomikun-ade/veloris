<script setup lang="ts" generic="T extends string">
defineProps<{
  type: T
  options: ReadonlyArray<{ value: T; label: string }>
}>()

const emit = defineEmits<{ 'update:type': [T] }>()
</script>

<template>
  <div
    class="inline-flex rounded-md border bg-surface-2 p-0.5"
    role="group"
    aria-label="Chart type"
  >
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      :aria-pressed="type === opt.value"
      :class="[
        'rounded px-1.5 py-0.5 text-[10px] font-medium tracking-wider uppercase transition-colors',
        type === opt.value
          ? 'bg-accent text-on-accent'
          : 'text-muted hover:text-text',
      ]"
      @click="emit('update:type', opt.value)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>
