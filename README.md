# Veloris

Real-time cybersecurity threat-ops analytics dashboard. HNG Internship Stage 5A — Frontend Wizards submission.

> Status: scaffolding complete (Stage 1 of 11). The sections marked _TBD_ will be filled in as the build progresses.

## Stack

- **Vue 3** + **TypeScript** + **Vite**
- **Pinia** for state management
- **Tailwind CSS v3** for styling (Reka UI primitives coming in Stage 2)
- **Apache ECharts** via `vue-echarts` for visualization (Stage 4)
- **Web Worker** mock streaming generator (Stage 3) — no backend required
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

_TBD — populated as stages 2–10 land._

## State management strategy

_TBD — populated in Stage 3 when Pinia stores come online._

## Rendering optimization decisions

_TBD — populated in Stage 8._

## Data streaming approach

_TBD — populated in Stage 3._

## Trade-offs

- The brief suggests Zustand / Redux Toolkit / Recharts; those are React-only libraries. We deliberately picked the Vue-native equivalents (Pinia for state, `vue-echarts` for charts) — same grading concerns, idiomatic to the chosen framework.
- _More TBD as design decisions accumulate._

## Folder structure

```
src/
  assets/        static assets
  components/    reusable UI components
  composables/   Vue composables (reactive logic units)
  lib/           framework-agnostic utilities
  stores/        Pinia stores
  types/         shared TypeScript types & schemas
  workers/       Web Workers (mock data stream, etc.)
```

## Project plan

Veloris is being built across 11 commitable stages. See `docs/PRODUCT.md` for the brief and grading rubric.
