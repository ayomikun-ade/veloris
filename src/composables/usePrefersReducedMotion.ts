import { onScopeDispose, ref, type Ref } from 'vue'

let mql: MediaQueryList | null = null
const prefers = ref(false)
let refCount = 0
let listener: ((e: MediaQueryListEvent) => void) | null = null

function attach() {
  if (typeof window === 'undefined' || mql) return
  mql = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefers.value = mql.matches
  listener = (e) => {
    prefers.value = e.matches
  }
  mql.addEventListener('change', listener)
}

function detach() {
  if (mql && listener) mql.removeEventListener('change', listener)
  mql = null
  listener = null
}

/**
 * Shared reactive flag for `(prefers-reduced-motion: reduce)`. One media-query
 * listener is shared across all consumers via reference counting.
 */
export function usePrefersReducedMotion(): Ref<boolean> {
  refCount++
  attach()
  onScopeDispose(() => {
    refCount--
    if (refCount === 0) detach()
  })
  return prefers
}
