/**
 * Parâmetros visuais dos gráficos (Recharts).
 * A paleta categórica foi validada para daltonismo e contraste —
 * as cores são atribuídas em ordem fixa, nunca recicladas por ranking.
 */

export const chartCategorical = ['#1567B3', '#0E8A6E', '#B5761A', '#8A4FA8', '#B0524C'] as const

/** Cores de estado — reservadas, nunca usadas como "série 4". */
export const chartStatus = {
  critical: '#C8322B',
  warning: '#C97A0E',
  success: '#1B8A54',
  info: '#1567B3',
  neutral: '#7C8996',
} as const

export const chartAxis = {
  stroke: '#D3DAE1',
  tick: { fill: '#7C8996', fontSize: 11, fontFamily: '"JetBrains Mono", monospace' },
  grid: '#E7ECF1',
}

export const chartMargin = { top: 8, right: 12, bottom: 4, left: -8 }
