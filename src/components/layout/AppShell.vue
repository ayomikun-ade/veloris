<script setup lang="ts">
import { ref } from 'vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import MobileNav from '@/components/layout/MobileNav.vue'

const mobileNavOpen = ref(false)
</script>

<template>
  <div class="flex min-h-screen bg-bg text-text">
    <AppSidebar />
    <div class="flex min-w-0 flex-1 flex-col">
      <AppTopbar @open-mobile-nav="mobileNavOpen = true" />
      <main class="flex-1 overflow-auto">
        <slot />
      </main>
    </div>
    <MobileNav v-model:open="mobileNavOpen" />
  </div>
</template>
