# Veloris

Real-time cybersecurity threat-ops analytics dashboard. HNG Internship Stage 5A — Frontend Wizards submission.

> Status: Stage 3 of 11 — streaming pipeline online (Web Worker → stores → reactive UI). Charts land in Stage 4.

## Stack

- **Vue 3** + **TypeScript** + **Vite**
- **Pinia** for state management
- **Tailwind CSS v4** for styling (CSS-first `@theme` config)
- **IBM Plex Sans / Mono** typography via `@fontsource`
- **Hugeicons** (`@hugeicons/vue` + `@hugeicons/core-free-icons`) for iconography
- **Apache ECharts** via `vue-echarts` for visualization _(Stage 4)_
- **Web Worker** mock streaming generator — no backend required
- **zod** for runtime payload validation at the worker boundary
- **pnpm** as the package manager

## Getting started

```bash
pnpm install
pnpm dev
```

Then open the URL printed by Vite.

### Other scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Start the Vite dev server |
| `pnpm build` | Type-check (`vue-tsc`) and build for production |
| `pnpm preview` | Preview the production build locally |
| `pnpm type-check` | Run TypeScript type-checking only |
| `pnpm lint` | Run ESLint with `--fix` |
| `pnpm format` | Run Prettier across `src/` |

## Architecture

```
Web Worker (stream.worker.ts)
      │  batched postMessage every 100ms
      ▼
useStreamConnection composable
      │  zod-validates each payload at the boundary
      ▼
Pinia stores ── connection ── events (capped buffer) ── metrics (derived)
      │
      ▼
Reactive Vue components (AppTopbar, DashboardOverview, …)
```

- The Web Worker isolates event generation from the UI thread.
- The composable is the only place that talks to the worker; it forwards control messages (`start` / `pause` / `resume` / `set-throughput` / `stop`) and ingests batches.
- Stores are the single source of truth for downstream components. Components never import the worker or the composable's internal handlers directly.
- Stage 4+ chart/feed components subscribe to `events` and `metrics` stores via Pinia.

## State management strategy

Three Pinia stores, kept narrow and orthogonal:

- [`connection`](src/stores/connection.ts) — connection lifecycle (`idle | connecting | connected | paused | disconnected`), target throughput, dropped-payload counter. Drives the topbar status pill and any pause/throughput UI.
- [`events`](src/stores/events.ts) — capped 5,000-event newest-first buffer. Uses **`shallowRef` + `triggerRef`** so Vue tracks identity changes only, not deep object properties. Crucial for sustained ingestion: per-event deep reactivity would tank perf at 25+ e/s.
- [`metrics`](src/stores/metrics.ts) — derived state (`eventsPerSecond` over a 5s window, `criticalCount`, `blockedRate`). Pure `computed` views over `events.events`. Vue caches the computation and only re-runs when the events ref is `triggerRef`'d.

Pinia 3's setup-style stores are used throughout (`defineStore('name', () => { ... })`) — same shape as a regular composable, so the code is easy to reason about side-by-side with the rest of the app.

## Data streaming approach

A long-running **Web Worker** (`src/workers/stream.worker.ts`) emits batches of `ThreatEvent` payloads every 100 ms. Batching matters: at 25 events/sec, a per-event `postMessage` would mean ~250 main-thread transitions per second; batching collapses that to 10, which leaves the UI thread free for paint work.

The worker accepts control messages:

| Message | Effect |
| --- | --- |
| `start` | begin emitting batches; transition to `connected` |
| `pause` | hold the generator; transition to `paused` |
| `resume` | leave `paused`; back to `connected` |
| `set-throughput` | adjust events-per-second (clamped 1–1000) |
| `stop` | tear down the interval |

**Validation at the boundary.** Every payload is run through `ThreatEventSchema` (zod) inside `useStreamConnection` before it touches the store. Schema failures bump a `droppedPayloads` counter on the connection store rather than throwing — the UI never crashes on malformed data, per the spec's resilience requirements. This shape will hold unchanged when we swap the worker for a real WebSocket later.

**Why the worker, not the main thread?** Generating events on the main thread (or via `setInterval` in a composable) would compete with Vue's reactivity and render work. The worker keeps generation off the critical path; everything reaching the main thread is already structured data, ready to ingest.

## Rendering optimization decisions

_TBD — populated in Stage 8 (perf pass)._

Already in place from this stage:

- `shallowRef` for the event buffer (no deep reactivity tax)
- `triggerRef` so mutations on the buffer trigger updates exactly once per batch
- 100 ms worker batching to amortize structured-clone cost across many events

## Trade-offs

- The brief suggests **Zustand / Redux Toolkit / Recharts** — those are React-only. Picked the Vue-native equivalents (**Pinia** for state, **`vue-echarts`** for charts coming in Stage 4) — same grading concerns, idiomatic to the chosen framework.
- **Mocked stream over a real backend.** Self-contained demo, no server to spin up; lets us stress-test throughput deterministically. The composable's surface is shaped so a real WebSocket is a one-file swap.
- **No `DataSource` interface (yet).** The Stage 1 plan called for an explicit transport abstraction; in practice, `useStreamConnection` IS the boundary — adding a separate interface before a second transport exists is speculative scope.

## Folder structure

```
src/
  assets/        static assets
  components/    reusable UI components
  composables/   Vue composables (reactive logic units)
  lib/           framework-agnostic utilities
  stores/        Pinia stores
  types/         shared TypeScript types & zod schemas
  workers/       Web Workers (mock data stream, etc.)
```

## Project plan

Veloris is being built across 11 commitable stages. See `docs/PRODUCT.md` for the brief and grading rubric.
