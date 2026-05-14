import {
  onBeforeUnmount,
  shallowRef,
  triggerRef,
  watchEffect,
  type ShallowRef,
} from 'vue'

/**
 * Snapshot the value returned by `getter` at most once per `ms` milliseconds.
 *
 * Use this to throttle chart re-renders against a high-frequency reactive
 * source (e.g. an in-place-mutated shallowRef buffer). Downstream computeds
 * read `.value` and depend on the snapshot, so they re-run at the throttled
 * cadence — but they can still read other reactive state directly inside the
 * computed body (e.g. filters), and those reads stay instant.
 *
 * The watchEffect re-runs whenever any of the getter's reactive deps trigger
 * (including `triggerRef` on a shallowRef that hands back the same reference),
 * which a plain `watch(getter, cb)` would skip because its identity check sees
 * an unchanged value.
 */
export function useThrottledRef<T>(getter: () => T, ms: number): Readonly<ShallowRef<T>> {
  const snapshot = shallowRef<T>(getter())
  let scheduled: number | null = null

  watchEffect(() => {
    // Touch the source to register reactive deps.
    getter()
    if (scheduled !== null) return
    scheduled = window.setTimeout(() => {
      snapshot.value = getter()
      // The source may mutate in place; force a trigger even when the
      // reference is the same as the previous snapshot.
      triggerRef(snapshot)
      scheduled = null
    }, ms)
  })

  onBeforeUnmount(() => {
    if (scheduled !== null) {
      clearTimeout(scheduled)
      scheduled = null
    }
  })

  return snapshot
}
