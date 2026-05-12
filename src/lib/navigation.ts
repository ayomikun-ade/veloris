import {
  Activity01Icon,
  DashboardCircleIcon,
  Globe02Icon,
  GridViewIcon,
} from '@hugeicons/core-free-icons'

export interface NavItem {
  id: string
  label: string
  icon: typeof DashboardCircleIcon
  href: string
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: DashboardCircleIcon, href: '#overview' },
  { id: 'threats', label: 'Threats', icon: Globe02Icon, href: '#threats' },
  { id: 'activity', label: 'Activity', icon: Activity01Icon, href: '#activity' },
  { id: 'patterns', label: 'Patterns', icon: GridViewIcon, href: '#patterns' },
]
