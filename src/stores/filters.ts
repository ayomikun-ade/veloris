import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { SEVERITIES, type Severity } from '@/types/event'

export const TIME_RANGE_OPTIONS = [60, 300, 900, 3600] as const
export type TimeRangeSec = (typeof TIME_RANGE_OPTIONS)[number]

export const TIME_RANGE_LABEL: Record<TimeRangeSec, string> = {
  60: '1m',
  300: '5m',
  900: '15m',
  3600: '1h',
}

export const useFiltersStore = defineStore('filters', () => {
  const search = ref('')
  const activeSeverities = ref<Set<Severity>>(new Set(SEVERITIES))
  const timeRangeSec = ref<TimeRangeSec>(300)

  function toggleSeverity(sev: Severity) {
    const next = new Set(activeSeverities.value)
    if (next.has(sev)) next.delete(sev)
    else next.add(sev)
    activeSeverities.value = next
  }

  function setTimeRange(s: TimeRangeSec) {
    timeRangeSec.value = s
  }

  function clear() {
    search.value = ''
    activeSeverities.value = new Set(SEVERITIES)
  }

  const isDefault = computed(() => {
    return search.value.length === 0 && activeSeverities.value.size === SEVERITIES.length
  })

  return {
    search,
    activeSeverities,
    timeRangeSec,
    isDefault,
    toggleSeverity,
    setTimeRange,
    clear,
    TIME_RANGE_OPTIONS,
    TIME_RANGE_LABEL,
  }
})
