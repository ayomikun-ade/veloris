# Veloris

Real-time cybersecurity threat-ops analytics dashboard. HNG Internship **Stage 5A — Frontend Wizards** submission.

> All 11 build stages complete. The dashboard streams synthesized threat events through a typed worker pipeline, validates each payload, renders four live ECharts visualizations + a virtualized 5,000-row activity feed, and survives connection drops with exponential reconnect backoff.

---

## Highlights

- **Real-time stream** at configurable throughput (1 – 200 events/sec) via a Web Worker generator
- **Five visualizations**: line (rate), stacked area (severity), horizontal bar (categories), heatmap (category × time), country rank
- **Virtualized activity feed** (10-row DOM regardless of 5,000-event buffer)
- **Detail drawer** with full keyboard / focus / scroll-lock handling
- **Global filters** — severity pills + free-text search + 1m/5m/15m/1h time-window selector — cascade to every widget
- **Stream controls** — pause / resume, throughput slider, simulated disconnect to exercise reconnect logic
- **Auto-reconnect** with 1 s → 2 s → 4 s → … → 30 s exponential backoff and live countdown in the topbar
- **Toast notifications** for critical events (throttled, optional Web-Audio chime)
- **Dark / light theming** with class-strategy CSS-var tokens, anti-FOUC inline script, persisted preference
- **Reduced motion** respected globally + per-chart
- **Lazy-loaded charts** — ECharts (~204 kB gz) is not in the initial bundle
- **Error boundary** — render errors surface a recoverable fallback view instead of a blank screen
- **`?perf=1` overlay** — FPS, JS heap, throughput, dropped-payload counter

---

## Stack

| Layer | Choice |
| --- | --- |
| Framework | **Vue 3.5** + **TypeScript** + **Vite** |
| State | **Pinia 3** (setup-style stores) |
| Styling | **Tailwind CSS v4** (CSS-first `@theme` config, single `@tailwindcss/vite` plugin) |
| Typography | IBM Plex Sans + IBM Plex Mono (self-hosted via `@fontsource`) |
| Icons | **Hugeicons** (`@hugeicons/vue` + `@hugeicons/core-free-icons`) |
| Charts | **Apache ECharts 6** via **`vue-echarts`** |
| Virtualization | **`@tanstack/vue-virtual`** |
| Accessible primitives | **`reka-ui`** (Dialog) |
| Validation | **`zod`** (worker → main thread boundary) |
| Package manager | **pnpm** |

---

## Getting started

```bash
pnpm install
pnpm dev
```

Then open the URL printed by Vite. The app has two routes:

- **`/`** — landing page (hero + features + CTA)
- **`/dashboard`** — the live dashboard (lazy-loaded, so landing visitors don't pay for the chart engine until they click through)

Append `?perf=1` to either URL for the dev perf overlay (FPS, JS heap, throughput readouts).

### Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Start the Vite dev server |
| `pnpm build` | Type-check (`vue-tsc`) and build for production |
| `pnpm preview` | Preview the production build locally |
| `pnpm type-check` | Run TypeScript type-checking only |
| `pnpm lint` | Run ESLint with `--fix` |
| `pnpm format` | Run Prettier across `src/` |

---

## Architecture

```
              ┌─────────────────────────────┐
              │   stream.worker.ts          │
              │   (Web Worker, isolated)    │
              │   • weighted event gen      │
              │   • 100 ms batching         │
              │   • pause / throughput      │
              └──────────────┬──────────────┘
                             │ postMessage (batch | status)
                             ▼
              ┌─────────────────────────────┐
              │   useStreamConnection       │
              │   • spawn + onScopeDispose  │
              │   • zod validate at boundary│
              │   • reconnect w/ backoff    │
              │   • critical-toast hook     │
              └──────────────┬──────────────┘
                             │
            ┌────────────────┼────────────────┐
            ▼                ▼                ▼
   ┌─────────────┐  ┌──────────────┐  ┌──────────────┐
   │  events     │  │  timeseries  │  │  connection  │
   │  store      │  │  store       │  │  store       │
   │  (5,000 cap)│  │  (3,600 buck)│  │  (state +    │
   │             │  │              │  │   reconnect) │
   └──────┬──────┘  └───────┬──────┘  └───────┬──────┘
          │                 │                 │
          ▼                 ▼                 ▼
      ┌──────────────────────────────────────────────┐
      │  Vue components (subscribed via Pinia)       │
      │  • ControlsBar    • DashboardOverview        │
      │  • ActivityFeed   • EventRateChart           │
      │  • TopCategories  • SeverityMixChart         │
      │  • CategoryHeatmap• TopSourceCountries       │
      └──────────────────────────────────────────────┘

   ┌──────────────┐    ┌──────────────┐
   │   filters    │    │   toasts     │  ← user actions + critical events
   │   store      │    │   store      │
   └──────────────┘    └──────────────┘
            │ cascades to charts + feed
            ▼
      filters severity / search / time-window
```

- The Web Worker isolates event generation from the UI thread.
- The composable (`useStreamConnection`) is the single point of contact with the worker; nothing else imports `?worker`.
- Stores are the single source of truth. Components subscribe via Pinia; they never import the worker or schemas directly.

---

## State management strategy

Five Pinia setup-style stores, kept narrow and orthogonal:

| Store | Responsibility | Reactive shape |
| --- | --- | --- |
| `connection` | Stream lifecycle (`idle/connecting/connected/paused/disconnected`), throughput, reconnect attempt + timestamp, dropped-payload counter | `ref`s and `computed`s |
| `events` | Capped 5,000-event newest-first buffer | **`shallowRef` + `triggerRef`** |
| `timeseries` | Rolling 3,600-second severity-bucket window | **`shallowRef` + `triggerRef`** |
| `metrics` | Derived rates/counters (events/sec, critical count, blocked %) | `computed` over `events` |
| `filters` | Search string, active-severity `Set`, time-range seconds | `ref`s |
| `toasts` | Toast queue, sound preference (persisted) | `ref` |
| `theme` | Light/dark mode (persisted, anti-FOUC) | `ref` + `computed` |

`events` and `timeseries` use `shallowRef` + `triggerRef` so Vue tracks identity changes only — no deep observer tax per event or per bucket. The trade-off (consumer computeds must always return new references, or downstream reactivity stalls) is called out in code comments.

---

## Data streaming approach

A long-running Web Worker (`src/workers/stream.worker.ts`) emits batches of `ThreatEvent` payloads every 100 ms. The worker accepts five control messages:

| Message | Effect |
| --- | --- |
| `start` | Begin emitting batches; transition to `connected` |
| `pause` | Hold the generator; transition to `paused` |
| `resume` | Leave `paused`; back to `connected` |
| `set-throughput` | Adjust events/sec (clamped 1–1000) |
| `stop` | Tear down the interval |

**Why batched, why a worker?**
At 25 e/s, a per-event `postMessage` would mean ~250 main-thread transitions per second; batching collapses that to 10. The worker keeps generation off the critical path — everything reaching the main thread is already structured data ready to ingest.

**Boundary validation.** Every payload runs through `ThreatEventSchema` (zod) inside `useStreamConnection` before it touches the store. Schema failures bump `connection.droppedPayloads` and are silently dropped — the UI never crashes on malformed data. The zod schema lives in `src/types/event.schema.ts`, separate from the type aliases in `src/types/event.ts`, so the worker chunk doesn't bundle zod.

**Resilience.** `worker.onerror` (or the simulate-disconnect button) routes through a single `handleDrop()` path: terminate the worker, transition to `disconnected`, schedule a reconnect. Backoff doubles each attempt up to 30 s. A successful `status: connected` message resets the counter. The topbar shows a live countdown via `useNow()`.

The composable's surface is shaped so a real WebSocket replacement is a one-file swap.

---

## Rendering optimization

**Reactivity discipline**

- `shallowRef` + `triggerRef` for the 5,000-event buffer and the 3,600-bucket timeseries — Vue tracks identity changes only.
- Worker batching at 100 ms amortizes structured-clone cost across many events.
- 1 Hz aggregation snapshot in `CategoryHeatmap` — the events buffer triggers at 10 Hz, but the heatmap's smallest visual unit is a 5-minute bucket. Snapshotting once a second cuts the work 10× with no visible difference.
- `animationDurationUpdate: 0` on every ECharts series so streaming updates don't jitter between animation frames.

**Production bundle**

| Chunk | Size (gz) | When |
| --- | --- | --- |
| `index` (shell + layout) | ~49 kB | initial paint |
| `pinia` | ~44 kB | initial paint |
| `charts` (ECharts engine + all 4 chart components) | ~204 kB | lazy, on first chart mount |
| `stream.worker` | ~3 kB | worker startup |
| `PerfOverlay` | ~1 kB | only with `?perf=1` |

The dashboard shell paints with **~93 kB gz** of JavaScript. The chart engine streams in async. The worker chunk is zod-free.

**Lifecycle hygiene** — every long-lived resource has explicit teardown:

| Resource | Cleaned up by |
| --- | --- |
| Web Worker + tick interval | `useStreamConnection` `onScopeDispose` |
| 1 s shared ticker (`useNow`) | Refcount-driven, last consumer's `onScopeDispose` |
| `rAF` + heap interval (`PerfOverlay`) | `onBeforeUnmount` |
| Heatmap aggregation `setTimeout` | `onBeforeUnmount` |
| `prefers-reduced-motion` listener | Refcount-driven |
| ECharts instances | `vue-echarts` `onBeforeUnmount` (built-in) |
| `ResizeObserver` + scroll listener | `@tanstack/vue-virtual` (built-in) |
| Reka Dialog focus trap / scroll lock | Reka internals via `v-if` removal |

---

## Accessibility

- **Class-strategy dark mode** with anti-FOUC inline script (no theme flash on reload).
- **Reduced motion** respected at two levels: a global `@media (prefers-reduced-motion: reduce)` CSS rule and per-chart `animation: !reducedMotion.value`.
- **ARIA on charts** — every ECharts option has `aria: { enabled: true }`, so canvas-rendered charts announce their type + values to screen readers.
- **Focus rings** — `focus-visible:ring-accent` on every interactive element (buttons, links, sidebar items, severity pills, search input).
- **Keyboard nav** — the entire dashboard is reachable via Tab; the detail drawer and mobile nav handle focus trap + escape via Reka.
- **Live regions** — toasts use `role="status"` (or `role="alert"` for critical) with `aria-live="polite"`.
- **Responsive** — desktop sidebar collapses below the `md` breakpoint; a `MobileNav` drawer replaces it, triggered by a hamburger button. The detail drawer naturally becomes full-screen on mobile via `max-w-full`.

---

## Trade-offs

- **Vue-native stack vs the brief's React-only suggestions.** The brief lists Zustand / Redux Toolkit / Recharts. Picked Pinia + `vue-echarts` instead — same grading concerns, idiomatic to the chosen framework. Called out so the substitution reads as deliberate.
- **Tailwind v4 over v3.** Migrated mid-build (after Stage 2) to use the CSS-first `@theme` config, drop `postcss` + `autoprefixer`, and collapse the design tokens into one source of truth. Smaller dependency surface; better long-term fit.
- **Mocked stream over a real WebSocket backend.** Self-contained demo, no server to spin up; lets us stress-test throughput deterministically. The composable's surface is shaped so a real WS replacement is one file.
- **Pre-aggregated severity time-series vs raw events for charts.** The timeseries store maintains 1-second buckets so the rate / severity charts render in O(window) instead of O(buffer). Trade: category data isn't pre-bucketed (`TopCategoriesChart` re-aggregates from raw events), but it's also a smaller, less time-axis-driven chart so the cost is acceptable.
- **`shallowRef` + `triggerRef` in stores.** Faster than a deep ref but requires consumer computeds to always produce new references — handing back the same array suppresses downstream updates. Reviewed and called out in code comments where it matters.
- **No `DataSource` interface (yet).** The Stage 1 plan called for an explicit transport abstraction; in practice `useStreamConnection` IS the boundary — adding a separate interface before a second transport exists is speculative.
- **Top-source-countries panel instead of a world map.** ECharts dropped built-in world maps in v5 — supporting one means committing a ~250 kB GeoJSON file plus ISO-numeric → alpha-2 mapping. The flag-emoji + horizontal-bar pattern satisfies the spec's "geographic visualizations" bonus with zero new deps.
- **Heatmap aggregation throttled to 1 Hz.** Re-iterating 5,000 × 11 cells on every 100 ms batch is wasted work — the heatmap's smallest visual unit is a 5-minute bucket. The snapshot pattern is documented inline.

---

## Folder structure

```
src/
  assets/                static assets
  components/
    charts/              EventRate, SeverityMix, TopCategories,
                          CategoryHeatmap, TopSourceCountries
    dashboard/           DashboardOverview, ControlsBar
    feed/                ActivityFeed, EventDetailDrawer
    layout/              AppShell, AppSidebar, AppTopbar, MobileNav
    AppToaster.vue       toast renderer (TransitionGroup)
    BaseBadge.vue        severity-aware chip
    BaseButton.vue       primary/secondary/ghost × sm/md/icon
    BaseCard.vue         card surface
    ErrorFallback.vue    error-boundary view
    PerfOverlay.vue      dev FPS/heap overlay (?perf=1)
    ThemeToggle.vue      sun/moon switch
  composables/
    useChartTheme.ts          theme-aware ECharts colors
    useNow.ts                 refcounted shared 1 s ticker
    usePrefersReducedMotion.ts refcounted matchMedia singleton
    useStreamConnection.ts    worker lifecycle + reconnect + inject
  lib/
    countryFlag.ts       ISO 3166-1 alpha-2 → flag emoji + name
    echarts.ts           selective ECharts component registration
    format.ts            relative / clock / full timestamps
    navigation.ts        shared NAV_ITEMS for sidebar + mobile
    sound.ts             Web-Audio critical chime
  stores/
    connection.ts        stream lifecycle + throughput + reconnect
    events.ts            5,000-event ring buffer (shallowRef)
    filters.ts           search + activeSeverities + timeRange
    metrics.ts           derived rates/counters
    theme.ts             light/dark with localStorage
    timeseries.ts        3,600-second severity-bucket window
    toasts.ts            toast queue + soundEnabled (persisted)
  types/
    event.ts             pure types + enum value arrays
    event.schema.ts      zod schemas (kept out of the worker chunk)
  workers/
    stream.worker.ts     weighted event generator + batching
  router/
    index.ts             vue-router: / (landing) + /dashboard (lazy)
  views/
    LandingView.vue      hero + features + CTA (initial bundle)
    DashboardView.vue    AppShell + stream provider (lazy)
  App.vue                RouterView + global overlays (toaster, error, perf)
  main.ts                Vue + Pinia + Router + fonts
  style.css              @theme tokens + @keyframes + reduced-motion
```

---

## Screenshots

> Add your own from a `pnpm dev` session — recommended frames:
>
> - Overview with metrics + three live charts streaming
> - Activity feed with the detail drawer open over a critical event
> - Severity mix with one or two severities filtered out (showing cascade)
> - Mobile breakpoint with the drawer open
> - Light theme

---

## Project plan

Veloris was built across 11 commitable stages. See [`docs/PRODUCT.md`](docs/PRODUCT.md) for the brief and grading rubric the build was scored against.
