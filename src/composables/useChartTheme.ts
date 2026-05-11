import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

export interface ChartTheme {
  isDark: boolean
  text: string
  muted: string
  grid: string
  border: string
  surface: string
  tooltipBg: string
  accent: string
  severity: {
    info: string
    low: string
    medium: string
    high: string
    critical: string
  }
}

const SEVERITY = {
  info: '#38bdf8',
  low: '#34d399',
  medium: '#fbbf24',
  high: '#fb923c',
  critical: '#f43f5e',
} as const

export function useChartTheme() {
  const theme = useThemeStore()

  return computed<ChartTheme>(() => {
    const dark = theme.isDark
    return {
      isDark: dark,
      text: dark ? '#e2e8f0' : '#0f0f14',
      muted: dark ? '#828aa8' : '#646473',
      grid: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      border: dark ? '#202636' : '#e2e2e6',
      surface: dark ? '#0f121c' : '#ffffff',
      tooltipBg: dark ? '#0f121c' : '#ffffff',
      accent: dark ? '#22d3ee' : '#0891b2',
      severity: SEVERITY,
    }
  })
}
