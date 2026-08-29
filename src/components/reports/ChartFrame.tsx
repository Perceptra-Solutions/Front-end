import * as React from 'react'
import { cn } from '@/lib/utils'

interface ChartFrameProps {
  title: string
  code: string
  hint?: string
  legend?: { label: string; color: string }[]
  className?: string
  height?: number
  children: React.ReactNode
}

/** Moldura padrão dos gráficos: título técnico, legenda e área de plotagem. */
export function ChartFrame({ title, code, hint, legend, className, height = 240, children }: ChartFrameProps) {
  return (
    <section className={cn('flex flex-col rounded-md border border-border bg-card shadow-panel', className)}>
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h3 className="font-display text-[12.5px] font-600 uppercase tracking-[0.1em] text-graphite-700">{title}</h3>
          <p className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-graphite-300">{code}</p>
        </div>
        {legend && (
          <ul className="flex flex-wrap items-center gap-3">
            {legend.map((l) => (
              <li key={l.label} className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-graphite-500">
                <span className="h-2 w-2 rounded-[1px]" style={{ background: l.color }} />
                {l.label}
              </li>
            ))}
          </ul>
        )}
      </header>
      <div className="flex-1 px-2 py-3" style={{ minHeight: height }}>
        {children}
      </div>
      {hint && <p className="border-t border-border px-4 py-2 text-[12px] text-graphite-400">{hint}</p>}
    </section>
  )
}

interface TooltipPayloadItem {
  name?: string
  value?: number | string
  color?: string
  dataKey?: string | number
}

/** Tooltip com a mesma linguagem dos rótulos técnicos do sistema. */
export function ChartTooltip({
  active,
  payload,
  label,
  suffix = '',
}: {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string | number
  suffix?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-[3px] border border-navy-700 bg-navy-900 px-2.5 py-2 shadow-raised">
      {label !== undefined && (
        <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/50">{label}</p>
      )}
      <ul className="space-y-0.5">
        {payload.map((p, i) => (
          <li key={i} className="flex items-center gap-2 font-mono text-[11.5px] text-white">
            <span className="h-2 w-2 rounded-[1px]" style={{ background: p.color }} />
            <span className="text-white/70">{p.name}</span>
            <span className="ml-auto tabular-nums">
              {typeof p.value === 'number' ? p.value.toLocaleString('pt-BR') : p.value}
              {suffix}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
