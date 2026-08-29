import * as React from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Paperclip, Send, CheckCircle2 } from 'lucide-react'
import { PageBody, PageHeader } from '@/components/shared/PageHeader'
import { EventTimeline } from '@/components/action-plans/EventTimeline'
import { EvidenciaImage } from '@/components/shared/EvidenciaImage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ActionStatusBadge } from '@/components/shared/StatusBadge'
import { useAppStore } from '@/store/AppStore'
import { cn, formatDate, num } from '@/lib/utils'
import type { ActionStatus } from '@/types'

const priorityLabel: Record<string, string> = {
  critical: 'Crítica',
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
}

export default function ActionPlans() {
  const { actionPlans, evidences, attachEvidence, sendToVerification, approveVerification } = useAppStore()
  const [status, setStatus] = React.useState<ActionStatus | 'all'>('all')
  const [selectedId, setSelectedId] = React.useState(actionPlans[0]?.id ?? '')
  const inputArquivoRef = React.useRef<HTMLInputElement>(null)

  const filtered = actionPlans.filter((p) => status === 'all' || p.status === status)
  const selected = actionPlans.find((p) => p.id === selectedId) ?? filtered[0] ?? actionPlans[0]
  const planEvidences = selected ? evidences.filter((e) => selected.evidenceIds.includes(e.id) || e.relatedCode === selected.code) : []

  return (
    <>
      <PageHeader
        eyebrow="Execução · Correção em campo"
        title="Planos de ação"
        description="Cada não conformidade confirmada gera uma ação com executor, prazo, custo e evidência de conclusão."
        meta={[
          { label: 'Em execução', value: String(actionPlans.filter((p) => p.status === 'in_progress').length).padStart(2, '0') },
          { label: 'Em verificação', value: String(actionPlans.filter((p) => p.status === 'verification').length).padStart(2, '0') },
          { label: 'Concluídas', value: String(actionPlans.filter((p) => p.status === 'done').length).padStart(2, '0') },
        ]}
      />

      <PageBody className="space-y-5">
        <Tabs value={status} onValueChange={(v) => setStatus(v as ActionStatus | 'all')}>
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="in_progress">Em execução</TabsTrigger>
            <TabsTrigger value="verification">Aguardando verificação</TabsTrigger>
            <TabsTrigger value="done">Concluídas</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid gap-5 xl:grid-cols-[minmax(300px,360px)_minmax(0,1fr)]">
          {/* lista */}
          <div className="flex min-w-0 flex-col gap-2.5">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={cn(
                  'rounded-md border bg-card p-3.5 text-left shadow-panel transition-all hover:border-technical-300',
                  selected?.id === p.id ? 'border-technical-500 ring-1 ring-technical-500/25' : 'border-border',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11.5px] font-600 text-technical-700">{p.code}</span>
                  <ActionStatusBadge status={p.status} />
                </div>
                <p className="mt-1.5 text-[14px] font-500 leading-snug text-graphite-900">{p.title}</p>
                <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-graphite-400">
                  {p.nonConformityCode} · {p.executor}
                </p>
                <div className="mt-2.5 flex items-center gap-2.5">
                  <Progress
                    value={p.progress}
                    className="h-1"
                    indicatorClassName={p.status === 'done' ? 'bg-status-success' : undefined}
                  />
                  <span className="shrink-0 font-mono text-[10.5px] tabular-nums text-graphite-400">{p.progress}%</span>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <Card>
                <CardContent className="py-10 text-center text-[13px] text-graphite-400">
                  Nenhum plano de ação neste status.
                </CardContent>
              </Card>
            )}
          </div>

          {/* detalhe */}
          {selected && (
            <div className="flex min-w-0 flex-col gap-5">
              <Card>
                <CardHeader>
                  <div>
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-graphite-400">{selected.code}</p>
                    <CardTitle className="mt-0.5 text-[16px] normal-case tracking-normal text-navy-900">{selected.title}</CardTitle>
                  </div>
                  <ActionStatusBadge status={selected.status} />
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-[13.5px] leading-relaxed text-graphite-600">{selected.description}</p>

                  <dl className="grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-3">
                    {[
                      { label: 'NC vinculada', value: selected.nonConformityCode },
                      { label: 'Responsável', value: selected.responsible },
                      { label: 'Executor', value: selected.executor },
                      { label: 'Prioridade', value: priorityLabel[selected.priority] },
                      { label: 'Prazo', value: formatDate(selected.deadline) },
                      { label: 'Custo', value: `R$ ${num(selected.cost)}` },
                    ].map((r) => (
                      <div key={r.label}>
                        <dt className="tech-label">{r.label}</dt>
                        <dd className="mt-0.5 text-[13.5px] text-graphite-900">{r.value}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="rounded-[3px] border border-border bg-graphite-50 p-3">
                    <p className="tech-label">Causa raiz</p>
                    <p className="mt-1 text-[13.5px] text-graphite-700">{selected.rootCause}</p>
                  </div>

                  {selected.verificationNote && (
                    <div className="rounded-[3px] border border-status-success/30 bg-status-success-bg p-3">
                      <p className="tech-label text-status-success">Parecer da verificação · {selected.verifiedBy}</p>
                      <p className="mt-1 text-[13.5px] text-graphite-700">{selected.verificationNote}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/non-conformities">
                        <ClipboardList className="h-3.5 w-3.5" />
                        Abrir {selected.nonConformityCode}
                      </Link>
                    </Button>

                    {selected.status === 'in_progress' && (
                      <>
                        <input
                          ref={inputArquivoRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,video/mp4,application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const arquivo = e.target.files?.[0]
                            e.target.value = ''
                            if (arquivo) void attachEvidence(selected.id, arquivo)
                          }}
                        />
                        <Button variant="outline" size="sm" onClick={() => inputArquivoRef.current?.click()}>
                          <Paperclip className="h-3.5 w-3.5" />
                          Anexar evidência
                        </Button>
                        <Button size="sm" onClick={() => void sendToVerification(selected.id)}>
                          <Send className="h-3.5 w-3.5" />
                          Enviar para verificação
                        </Button>
                      </>
                    )}

                    {selected.status === 'verification' && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => void approveVerification(selected.id, 'Correção conferida em campo. Requisito atendido.')}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Aprovar e fechar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-5 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Timeline da execução</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EventTimeline events={selected.timeline} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Evidências</CardTitle>
                    <Badge variant="outline">{planEvidences.length}</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2.5">
                      {planEvidences.map((e) => (
                        <figure key={e.id} className="overflow-hidden rounded-[3px] border border-border">
                          <div className="aspect-[4/3]">
                            <EvidenciaImage evidenciaId={e.id} fallbackVariant={e.sceneVariant} compact />
                          </div>
                          <figcaption className="space-y-0.5 bg-white px-2 py-1.5">
                            <p className="truncate text-[11.5px] text-graphite-700">{e.title}</p>
                            <p className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-graphite-400">
                              {e.code} · {e.author}
                            </p>
                          </figcaption>
                        </figure>
                      ))}
                      {planEvidences.length === 0 && (
                        <p className="col-span-2 rounded-[3px] border border-dashed border-graphite-200 px-3 py-6 text-center text-[12.5px] text-graphite-400">
                          Nenhuma evidência anexada.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </PageBody>
    </>
  )
}
