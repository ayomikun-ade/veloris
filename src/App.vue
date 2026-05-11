<script setup lang="ts">
import { ref } from 'vue'

const isDark = ref(true)
document.documentElement.classList.toggle('dark', isDark.value)

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}
</script>

<template>
  <main class="min-h-screen flex items-center justify-center px-6">
    <section class="max-w-xl w-full text-center space-y-6">
      <p class="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
        HNG Stage 5A · Frontend Wizards
      </p>
      <h1 class="text-5xl font-semibold tracking-tight">Veloris</h1>
      <p class="text-slate-600 dark:text-slate-300">
        Real-time cybersecurity threat-ops analytics. Scaffold ready.
      </p>
      <button
        type="button"
        class="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        @click="toggleTheme"
      >
        Toggle {{ isDark ? 'light' : 'dark' }} mode
      </button>
    </section>
  </main>
</template>
