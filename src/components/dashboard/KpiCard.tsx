import * as React from 'react'
import { TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  code: string
  value: string
  unit?: string
  hint: string
  icon: LucideIcon
  tone?: 'neutral' | 'critical' | 'warning' | 'success'
  trend?: { value: string; direction: 'up' | 'down'; positive: boolean }
  /** série curta para o sparkline (0–100) */
  spark?: number[]
  children?: React.ReactNode
}

const toneRing: Record<NonNullable<KpiCardProps['tone']>, string> = {
  neutral: 'text-technical-600 bg-technical-100',
  critical: 'text-status-critical bg-status-critical-bg',
  warning: 'text-status-warning bg-status-warning-bg',
  success: 'text-status-success bg-status-success-bg',
}

/** Indicador de operação — o número manda, o resto é contexto. */
export function KpiCard({ label, code, value, unit, hint, icon: Icon, tone = 'neutral', trend, spark, children }: KpiCardProps) {
  return (
    <div className="corner-marks relative flex flex-col justify-between rounded-md border border-border bg-card p-4 shadow-panel transition-shadow hover:shadow-raised">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-[11.5px] font-600 uppercase tracking-[0.11em] text-graphite-500">{label}</p>
          <p className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-graphite-300">{code}</p>
        </div>
        <span className={cn('flex h-8 w-8 items-center justify-center rounded-[3px]', toneRing[tone])}>
          <Icon className="h-4 w-4" />
        </span>
      </div>

      <div className="mt-4 flex items-end gap-1.5">
        <span className="font-display text-[40px] font-700 leading-none tabular-nums text-navy-900">{value}</span>
        {unit && <span className="pb-1 font-display text-[17px] font-600 text-graphite-400">{unit}</span>}
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-[12.5px] text-graphite-500">{hint}</p>
        {trend && (
          <span
            className={cn(
              'flex items-center gap-1 font-mono text-[11.5px] font-500 tabular-nums',
              trend.positive ? 'text-status-success' : 'text-status-critical',
            )}
          >
            {trend.direction === 'up' ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {trend.value}
          </span>
        )}
      </div>

      {spark && <Sparkline points={spark} tone={tone} />}
      {children}
    </div>
  )
}

function Sparkline({ points, tone }: { points: number[]; tone: NonNullable<KpiCardProps['tone']> }) {
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * 100
      const y = 26 - ((p - min) / range) * 22
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')

  const stroke =
    tone === 'critical' ? '#C8322B' : tone === 'warning' ? '#C97A0E' : tone === 'success' ? '#1B8A54' : '#1567B3'

  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="mt-3 h-7 w-full" aria-hidden>
      <path d={`${path} L 100 30 L 0 30 Z`} fill={stroke} opacity="0.08" />
      <path d={path} fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle
        cx="100"
        cy={26 - ((points[points.length - 1] - min) / range) * 22}
        r="2"
        fill={stroke}
      />
    </svg>
  )
}
