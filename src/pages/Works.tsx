import { Link } from 'react-router-dom'
import { Building2, Camera, MapPin, ShieldCheck, Siren } from 'lucide-react'
import { PageBody, PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { works } from '@/data/works'
import { formatDate, pct } from '@/lib/utils'
import type { WorkStatus } from '@/types'

const statusMeta: Record<WorkStatus, { label: string; variant: 'info' | 'warning' | 'success' | 'default' }> = {
  execution: { label: 'Em execução', variant: 'info' },
  foundation: { label: 'Fundação', variant: 'warning' },
  finishing: { label: 'Acabamento', variant: 'success' },
  delivered: { label: 'Entregue', variant: 'default' },
}

export default function Works() {
  return (
    <>
      <PageHeader
        eyebrow="Portfólio · Empreendimentos"
        title="Obras e locais"
        description="Empreendimentos monitorados pela plataforma, com avanço físico, conformidade e parque de câmeras."
        meta={[
          { label: 'Obras ativas', value: String(works.length) },
          { label: 'Câmeras', value: String(works.reduce((s, w) => s + w.camerasTotal, 0)) },
        ]}
      />

      <PageBody className="space-y-5">
        <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {works.map((w, i) => {
            const st = statusMeta[w.status]
            const current = i === 0
            return (
              <Card key={w.id} className={current ? 'border-technical-400 ring-1 ring-technical-400/20' : ''}>
                <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3.5">
                  <div className="min-w-0">
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-graphite-400">{w.code}</p>
                    <h3 className="mt-0.5 truncate font-display text-[17.5px] font-600 uppercase tracking-[0.01em] text-navy-900">
                      {w.name}
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-graphite-500">
                      <MapPin className="h-3 w-3" />
                      {w.city} · {w.state} — {w.client}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <Badge variant={st.variant}>{st.label}</Badge>
                    {current && <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-technical-600">obra atual</span>}
                  </div>
                </div>

                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-baseline justify-between">
                      <span className="tech-label">Avanço físico</span>
                      <span className="font-mono text-[14px] font-600 tabular-nums text-navy-900">{w.progress}%</span>
                    </div>
                    <Progress value={w.progress} className="mt-1.5 h-1.5" />
                  </div>

                  <div className="grid grid-cols-3 gap-3 border-t border-border pt-3">
                    <div>
                      <p className="flex items-center gap-1 tech-label">
                        <ShieldCheck className="h-3 w-3" />
                        Conformidade
                      </p>
                      <p className="mt-0.5 font-mono text-[15px] font-600 tabular-nums text-status-success">{pct(w.compliance)}</p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1 tech-label">
                        <Siren className="h-3 w-3" />
                        Alertas
                      </p>
                      <p className="mt-0.5 font-mono text-[15px] font-600 tabular-nums text-status-critical">
                        {String(w.activeAlerts).padStart(2, '0')}
                      </p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1 tech-label">
                        <Camera className="h-3 w-3" />
                        Câmeras
                      </p>
                      <p className="mt-0.5 font-mono text-[15px] font-600 tabular-nums text-graphite-900">
                        {w.camerasOnline}/{w.camerasTotal}
                      </p>
                    </div>
                  </div>

                  <dl className="grid grid-cols-2 gap-3 border-t border-border pt-3">
                    {[
                      { label: 'Estrutura', value: `${w.blocks} blocos · ${w.floors} pav` },
                      { label: 'Área', value: `${w.area.toLocaleString('pt-BR')} m²` },
                      { label: 'Início', value: formatDate(w.startDate) },
                      { label: 'Entrega', value: formatDate(w.deadline) },
                      { label: 'Resp. técnico', value: w.responsible },
                      { label: 'CREA', value: w.crea },
                    ].map((r) => (
                      <div key={r.label}>
                        <dt className="tech-label">{r.label}</dt>
                        <dd className="mt-0.5 text-[12.5px] text-graphite-700">{r.value}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-graphite-400">{w.coordinates}</span>
                    <Button asChild variant={current ? 'default' : 'outline'} size="xs">
                      <Link to={current ? '/dashboard' : '/works'}>
                        <Building2 className="h-3.5 w-3.5" />
                        {current ? 'Abrir painel' : 'Selecionar obra'}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </PageBody>
    </>
  )
}
