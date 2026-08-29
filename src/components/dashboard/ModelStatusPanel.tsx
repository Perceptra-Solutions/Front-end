import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { aiModels } from '@/data/aiModels'
import { pct } from '@/lib/utils'

/** Modelos de visão computacional em operação nas câmeras da obra. */
export function ModelStatusPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Modelos de IA em operação</CardTitle>
        <Link to="/ai-models" className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-technical-600 hover:underline">
          Detalhes
        </Link>
      </CardHeader>
      <CardContent className="space-y-3.5">
        {aiModels.map((m) => (
          <div key={m.id} className="border-b border-border pb-3.5 last:border-0 last:pb-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-display text-[13px] font-600 uppercase tracking-[0.03em] text-navy-900">
                  {m.name} <span className="text-graphite-400">{m.version}</span>
                </p>
                <p className="truncate font-mono text-[10px] uppercase tracking-[0.1em] text-graphite-400">
                  {m.code} · {m.cameras} câmeras · {m.latencyMs} ms
                </p>
              </div>
              <Badge variant={m.status === 'active' ? 'success' : 'warning'}>
                {m.status === 'active' ? 'Ativo' : 'Treinando'}
              </Badge>
            </div>

            <div className="mt-2.5 flex items-center gap-3">
              <Progress
                value={m.f1}
                className="h-1"
                indicatorClassName={m.status === 'active' ? 'bg-status-success' : 'bg-status-warning'}
              />
              <span className="shrink-0 font-mono text-[11px] tabular-nums text-graphite-500">F1 {pct(m.f1)}</span>
            </div>

            <div className="mt-2 flex gap-4 font-mono text-[10.5px] text-graphite-400">
              <span>
                DETECÇÕES HOJE <span className="text-graphite-700">{m.detectionsToday}</span>
              </span>
              <span>
                CONFIRMADAS <span className="text-graphite-700">{pct(m.confirmedRate)}</span>
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
