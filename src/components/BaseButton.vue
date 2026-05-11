<script setup lang="ts">
type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'icon'

const { variant = 'secondary', size = 'md' } = defineProps<{
  variant?: Variant
  size?: Size
}>()

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-accent text-on-accent hover:opacity-90',
  secondary: 'bg-surface-2 text-text border hover:bg-border/60',
  ghost: 'text-muted hover:text-text hover:bg-surface-2',
}

const SIZES: Record<Size, string> = {
  sm: 'h-7 px-2 text-xs gap-1',
  md: 'h-9 px-3 text-sm gap-1.5',
  icon: 'h-8 w-8',
}
</script>

<template>
  <button
    type="button"
    :class="[
      'inline-flex items-center justify-center rounded-md font-medium transition-colors',
      'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent',
      'disabled:cursor-not-allowed disabled:opacity-50',
      VARIANTS[variant],
      SIZES[size],
    ]"
  >
    <slot />
  </button>
</template>
