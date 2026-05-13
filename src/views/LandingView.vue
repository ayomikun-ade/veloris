<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { HugeiconsIcon } from '@hugeicons/vue'
import {
  Activity01Icon,
  ArrowRight02Icon,
  Chart01Icon,
  DashboardCircleIcon,
  Shield02Icon,
  Wifi01Icon,
} from '@hugeicons/core-free-icons'
import ThemeToggle from '@/components/ThemeToggle.vue'

const features = [
  {
    icon: Wifi01Icon,
    title: 'Real-time pipeline',
    description:
      'Web Worker generates synthesized threat events, zod validates each payload at the boundary, Pinia stores fan out to every widget.',
  },
  {
    icon: Chart01Icon,
    title: 'Five live visualizations',
    description:
      'ECharts-backed event-rate, severity-mix, top-categories, activity heatmap, and source-country rankings. Each respects the global filter cascade.',
  },
  {
    icon: Shield02Icon,
    title: 'Resilient by design',
    description:
      'Exponential reconnect backoff with live countdown, render-error boundary, dropped-payload counter, and reduced-motion respect across the board.',
  },
  {
    icon: Activity01Icon,
    title: 'Built for performance',
    description:
      'shallowRef + triggerRef stores, virtualized 5,000-row activity feed, lazy-loaded chart engine, throttled aggregation — runs smoothly at 200 events/sec.',
  },
]

const stats = [
  { value: '5', label: 'visualizations' },
  { value: '5,000', label: 'events buffered' },
  { value: '~43 KB', label: 'initial bundle (gz)' },
  { value: '11', label: 'build stages' },
]
</script>

<template>
  <div class="relative min-h-screen overflow-x-hidden bg-bg text-text">
    <!-- Background -->
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_30%,rgb(34_211_238/0.12),transparent_70%)]"
    />
    <div
      class="pointer-events-none absolute inset-0 opacity-[0.35]"
      style="
        background-image:
          linear-gradient(to right, var(--color-border) 1px, transparent 1px),
          linear-gradient(to bottom, var(--color-border) 1px, transparent 1px);
        background-size: 48px 48px;
      "
    />
    <div
      class="pointer-events-none absolute inset-0"
      style="
        background:
          radial-gradient(ellipse at top, transparent 40%, var(--color-bg) 95%);
      "
    />

    <!-- Top bar (lightweight) -->
    <header
      class="relative z-10 flex h-16 items-center justify-between px-6 md:px-10"
    >
      <div class="flex items-center gap-2">
        <HugeiconsIcon :icon="Shield02Icon" :size="22" class="text-accent" />
        <span class="font-semibold tracking-tight">Veloris</span>
      </div>
      <div class="flex items-center gap-3">
        <RouterLink
          to="/dashboard"
          class="hidden text-sm text-muted transition-colors hover:text-text sm:inline"
        >
          Dashboard
        </RouterLink>
        <ThemeToggle />
      </div>
    </header>

    <!-- Hero -->
    <main class="relative z-10 mx-auto max-w-6xl px-6 pt-12 pb-20 md:px-10 md:pt-20">
      <section class="text-center">
        <div
          class="mx-auto inline-flex items-center gap-2 rounded-full border bg-surface/60 px-3 py-1 text-[11px] font-medium tracking-[0.18em] text-muted uppercase backdrop-blur"
        >
          <span class="relative flex h-1.5 w-1.5">
            <span
              class="absolute inset-0 inline-flex h-full w-full animate-ping rounded-full bg-severity-low opacity-75"
            />
            <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-severity-low" />
          </span>
          Live demo available
        </div>

        <h1
          class="mt-6 text-5xl font-semibold tracking-tight md:text-7xl"
          style="letter-spacing: -0.04em"
        >
          Real-time threat-ops,
          <span class="text-accent">in the browser.</span>
        </h1>

        <p class="mx-auto mt-6 max-w-2xl text-base text-muted md:text-lg">
          Veloris streams synthesized cybersecurity events through a typed Vue pipeline.
          Five live visualizations, a virtualized 5,000-row activity feed, and exponential
          reconnect backoff — all driven by a Web Worker generator with no backend required.
        </p>

        <div class="mt-10 flex flex-wrap items-center justify-center gap-3">
          <RouterLink
            to="/dashboard"
            class="inline-flex h-11 items-center gap-2 rounded-md bg-accent px-5 text-sm font-semibold text-on-accent shadow-lg shadow-accent/20 transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-hidden"
          >
            Launch dashboard
            <HugeiconsIcon :icon="ArrowRight02Icon" :size="16" />
          </RouterLink>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener"
            class="inline-flex h-11 items-center gap-2 rounded-md border bg-surface px-5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-hidden"
          >
            View the README
          </a>
        </div>

        <!-- Stats strip -->
        <div
          class="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border/40 md:grid-cols-4"
        >
          <div
            v-for="s in stats"
            :key="s.label"
            class="bg-surface/60 px-4 py-5 backdrop-blur"
          >
            <p class="font-mono text-2xl font-semibold tracking-tight text-text tabular-nums">
              {{ s.value }}
            </p>
            <p class="mt-1 text-[11px] tracking-[0.18em] text-muted uppercase">
              {{ s.label }}
            </p>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section class="mt-24">
        <div class="text-center">
          <p class="text-[11px] font-medium tracking-[0.22em] text-accent uppercase">
            What's inside
          </p>
          <h2 class="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Engineered for live data, end to end.
          </h2>
        </div>

        <div class="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div
            v-for="f in features"
            :key="f.title"
            class="group relative overflow-hidden rounded-lg border bg-surface/60 p-6 backdrop-blur transition-colors hover:border-accent/40"
          >
            <div
              class="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-accent/5 blur-2xl transition-opacity group-hover:opacity-100"
            />
            <div class="relative">
              <span
                class="inline-flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 text-accent"
              >
                <HugeiconsIcon :icon="f.icon" :size="20" />
              </span>
              <h3 class="mt-4 text-base font-semibold">{{ f.title }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-muted">{{ f.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Repeat CTA -->
      <section class="mt-24 text-center">
        <div
          class="mx-auto inline-flex flex-col items-center gap-5 rounded-xl border bg-surface/60 px-8 py-10 backdrop-blur md:flex-row md:gap-8 md:px-12"
        >
          <div class="flex items-center gap-3">
            <HugeiconsIcon :icon="DashboardCircleIcon" :size="22" class="text-accent" />
            <p class="text-left text-sm md:text-base">
              Ready to see the stream?
              <br class="hidden md:block" />
              <span class="text-muted">No setup, no backend — it's all live in the browser.</span>
            </p>
          </div>
          <RouterLink
            to="/dashboard"
            class="inline-flex h-10 items-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-hidden"
          >
            Launch dashboard
            <HugeiconsIcon :icon="ArrowRight02Icon" :size="16" />
          </RouterLink>
        </div>
      </section>
    </main>

    <footer class="relative z-10 border-t">
      <div
        class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-muted md:flex-row md:px-10"
      >
        <p>Veloris · v1.0</p>
        <p>Built with Vue 3, ECharts, Pinia, and a Web Worker.</p>
      </div>
    </footer>
  </div>
</template>
