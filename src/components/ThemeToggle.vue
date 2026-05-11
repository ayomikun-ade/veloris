<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue'
import { Sun01Icon, Moon01Icon } from '@hugeicons/core-free-icons'
import { useThemeStore } from '@/stores/theme'
import BaseButton from '@/components/BaseButton.vue'

const theme = useThemeStore()
</script>

<template>
  <BaseButton
    variant="ghost"
    size="icon"
    :aria-label="theme.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="theme.toggle()"
  >
    <HugeiconsIcon :icon="theme.isDark ? Sun01Icon : Moon01Icon" :size="18" />
  </BaseButton>
</template>
