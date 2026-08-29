import { PageBody, PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { standards } from '@/data/standards'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Standard } from '@/types'

const statusMeta: Record<Standard['status'], { label: string; variant: 'success' | 'warning' | 'critical'; bar: string }> = {
  conforme: { label: 'Conforme', variant: 'success', bar: 'bg-status-success' },
  atencao: { label: 'Atenção', variant: 'warning', bar: 'bg-status-warning' },
  nao_conforme: { label: 'Não conforme', variant: 'critical', bar: 'bg-status-critical' },
}

const categoryLabel: Record<Standard['category'], string> = {
  seguranca: 'Segurança do trabalho',
  desempenho: 'Desempenho da edificação',
  estrutural: 'Estrutural',
  eletrica: 'Instalações elétricas',
}

export default function Standards() {
  return (
    <>
      <PageHeader
        eyebrow="Conformidade · Base normativa"
        title="Requisitos e normas"
        description="As normas que a plataforma usa para classificar cada ocorrência. Toda NC nasce citando um item específico."
        meta={[
          { label: 'Normas', value: String(standards.length) },
          { label: 'Itens mapeados', value: String(standards.reduce((s, n) => s + n.items.length, 0)) },
        ]}
      />

      <PageBody className="space-y-4">
        {standards.map((s) => {
          const st = statusMeta[s.status]
          return (
            <Card key={s.id} className="overflow-hidden">
              <div className="flex">
                <span className={cn('w-1 shrink-0', st.bar)} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-4 py-3.5">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-[18px] font-700 uppercase tracking-[0.02em] text-navy-900">{s.ref}</span>
                        <Badge variant={st.variant}>{st.label}</Badge>
                        <Badge variant="outline">{categoryLabel[s.category]}</Badge>
                      </div>
                      <p className="mt-1 text-[14px] font-500 text-graphite-800">{s.title}</p>
                      <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-graphite-400">{s.code}</p>
                    </div>

                    <div className="flex gap-6">
                      <div>
                        <p className="tech-label">Ocorrências</p>
                        <p className="font-mono text-[18px] font-600 tabular-nums text-graphite-900">{s.occurrences}</p>
                      </div>
                      <div>
                        <p className="tech-label">Em aberto</p>
                        <p
                          className={cn(
                            'font-mono text-[18px] font-600 tabular-nums',
                            s.openOccurrences > 0 ? 'text-status-critical' : 'text-status-success',
                          )}
                        >
                          {String(s.openOccurrences).padStart(2, '0')}
                        </p>
                      </div>
                      <div>
                        <p className="tech-label">Última verificação</p>
                        <p className="font-mono text-[13px] tabular-nums text-graphite-700">{formatDate(s.lastVerification)}</p>
                        <p className="font-mono text-[10.5px] text-graphite-400">{s.responsible}</p>
                      </div>
                    </div>
                  </div>

                  <CardContent className="space-y-3">
                    <p className="text-[13.5px] leading-relaxed text-graphite-600">{s.description}</p>
                    <ul className="divide-y divide-border rounded-[3px] border border-border">
                      {s.items.map((item) => (
                        <li key={item.ref} className="flex gap-3 px-3 py-2">
                          <span className="shrink-0 font-mono text-[11.5px] font-600 text-technical-700">{item.ref}</span>
                          <span className="text-[13px] text-graphite-600">{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </div>
              </div>
            </Card>
          )
        })}
      </PageBody>
    </>
  )
}
