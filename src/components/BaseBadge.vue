<script setup lang="ts">
type Variant = 'neutral' | 'info' | 'low' | 'medium' | 'high' | 'critical' | 'accent'

const { variant = 'neutral', dot = false } = defineProps<{
  variant?: Variant
  dot?: boolean
}>()

const CHIP: Record<Variant, string> = {
  neutral: 'bg-surface-2 text-muted',
  info: 'bg-severity-info/15 text-severity-info',
  low: 'bg-severity-low/15 text-severity-low',
  medium: 'bg-severity-medium/15 text-severity-medium',
  high: 'bg-severity-high/15 text-severity-high',
  critical: 'bg-severity-critical/15 text-severity-critical',
  accent: 'bg-accent/15 text-accent',
}

const DOT: Record<Variant, string> = {
  neutral: 'bg-muted',
  info: 'bg-severity-info',
  low: 'bg-severity-low',
  medium: 'bg-severity-medium',
  high: 'bg-severity-high',
  critical: 'bg-severity-critical',
  accent: 'bg-accent',
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium',
      CHIP[variant],
    ]"
  >
    <span v-if="dot" :class="['h-1.5 w-1.5 rounded-full', DOT[variant]]" />
    <slot />
  </span>
</template>
