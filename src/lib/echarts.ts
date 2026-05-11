import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, HeatmapChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  TitleComponent,
  VisualMapComponent,
} from 'echarts/components'

let registered = false

export function ensureEchartsRegistered() {
  if (registered) return
  registered = true
  use([
    CanvasRenderer,
    LineChart,
    BarChart,
    HeatmapChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    DataZoomComponent,
    TitleComponent,
    VisualMapComponent,
  ])
}

ensureEchartsRegistered()
