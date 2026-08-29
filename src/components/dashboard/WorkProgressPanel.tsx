import { Link } from 'react-router-dom'
import { Building2, CalendarDays, HardHat, Layers } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { currentWork } from '@/data/works'
import { formatDate } from '@/lib/utils'

/** Situação física da obra: avanço, estrutura e prazo contratual. */
export function WorkProgressPanel() {
  const w = currentWork
  const daysLeft = Math.round((new Date(w.deadline).getTime() - new Date('2026-08-28').getTime()) / 86_400_000)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Situação da obra</CardTitle>
        <span className="font-mono text-[10.5px] text-graphite-300">{w.code}</span>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-baseline justify-between">
            <span className="tech-label">Avanço físico</span>
            <span className="font-mono text-[15px] font-600 tabular-nums text-navy-900">{w.progress}%</span>
          </div>
          <Progress value={w.progress} className="mt-2 h-2" />
          <div className="mt-1.5 flex justify-between font-mono text-[10px] text-graphite-300">
            <span>FUNDAÇÃO</span>
            <span>ESTRUTURA</span>
            <span>ACABAMENTO</span>
            <span>ENTREGA</span>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-4">
          <div className="flex items-start gap-2">
            <Layers className="mt-0.5 h-3.5 w-3.5 text-graphite-300" />
            <div>
              <dt className="tech-label">Estrutura</dt>
              <dd className="text-[13px] text-graphite-700">
                {w.blocks} blocos · {w.floors} pavimentos
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Building2 className="mt-0.5 h-3.5 w-3.5 text-graphite-300" />
            <div>
              <dt className="tech-label">Área construída</dt>
              <dd className="text-[13px] tabular-nums text-graphite-700">{w.area.toLocaleString('pt-BR')} m²</dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CalendarDays className="mt-0.5 h-3.5 w-3.5 text-graphite-300" />
            <div>
              <dt className="tech-label">Prazo contratual</dt>
              <dd className="text-[13px] tabular-nums text-graphite-700">
                {formatDate(w.deadline)} <span className="text-graphite-400">· {daysLeft} d</span>
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <HardHat className="mt-0.5 h-3.5 w-3.5 text-graphite-300" />
            <div>
              <dt className="tech-label">Resp. técnico</dt>
              <dd className="text-[13px] text-graphite-700">{w.responsible}</dd>
            </div>
          </div>
        </dl>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-graphite-400">{w.coordinates}</span>
          <Button asChild variant="ghost" size="xs">
            <Link to="/map">Ver planta</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
