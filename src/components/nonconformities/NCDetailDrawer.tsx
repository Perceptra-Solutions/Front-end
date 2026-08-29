import * as React from 'react'
import { Link } from 'react-router-dom'
import { Bot, Camera, CheckCircle2, ClipboardList, FileWarning, Paperclip, Repeat2, Send, ThumbsDown } from 'lucide-react'
import { Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input, Textarea } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { FlowTimeline } from '@/components/shared/FlowTimeline'
import { SeverityBadge, NCStatusBadge } from '@/components/shared/StatusBadge'
import { EventTimeline } from '@/components/action-plans/EventTimeline'
import { EvidenciaImage } from '@/components/shared/EvidenciaImage'
import { CameraScene } from '@/components/cameras/CameraScene'
import { useAppStore } from '@/store/AppStore'
import { usuarioDemo } from '@/lib/api/client'
import { formatDate, formatTime, num } from '@/lib/utils'
import type { FlowStage, NonConformity } from '@/types'

interface NCDetailDrawerProps {
  nc: NonConformity | null
  onClose: () => void
}

const stageOf = (nc: NonConformity, hasPlan: boolean): FlowStage => {
  if (nc.status === 'resolved') return 'resolved'
  if (nc.status === 'verification') return 'verification'
  if (hasPlan) return 'action'
  return 'nonconformity'
}

export function NCDetailDrawer({ nc, onClose }: NCDetailDrawerProps) {
  const { actionPlans, evidences, createActionPlan, attachEvidence, sendToVerification, approveVerification, rejectVerification } =
    useAppStore()

  const [planOpen, setPlanOpen] = React.useState(false)
  const [verifyOpen, setVerifyOpen] = React.useState(false)
  const [form, setForm] = React.useState({
    title: '',
    description: '',
    rootCause: '',
    executor: usuarioDemo()?.nome ?? '—',
    deadline: '2026-08-30',
    cost: '850',
  })
  const [verificationNote, setVerificationNote] = React.useState('')
  const inputArquivoRef = React.useRef<HTMLInputElement>(null)

  const plan = nc ? actionPlans.find((p) => p.nonConformityId === nc.id) : undefined
  const ncEvidences = nc ? evidences.filter((e) => e.relatedCode === nc.code || (plan && e.relatedCode === plan.code)) : []

  React.useEffect(() => {
    if (nc) {
      setForm((f) => ({
        ...f,
        title: `Correção · ${nc.title}`,
        description: '',
        rootCause: '',
        deadline: nc.deadline,
      }))
      setVerificationNote('')
    }
  }, [nc])

  if (!nc) return null

  const stage = stageOf(nc, !!plan)

  const handleCreatePlan = async () => {
    await createActionPlan(nc.id, {
      title: form.title,
      description: form.description || 'Correção conforme procedimento da obra e requisito da norma aplicável.',
      rootCause: form.rootCause || 'A definir na análise de causa em campo.',
      executor: form.executor,
      deadline: form.deadline,
      cost: Number(form.cost) || 0,
    })
    setPlanOpen(false)
  }

  const handleAttachClick = () => inputArquivoRef.current?.click()

  const handleArquivoSelecionado = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0]
    e.target.value = ''
    if (!plan || !arquivo) return
    await attachEvidence(plan.id, arquivo)
  }

  const handleSend = async () => {
    if (!plan) return
    await sendToVerification(plan.id)
  }

  const handleApprove = async () => {
    if (!plan) return
    await approveVerification(plan.id, verificationNote || 'Correção conferida em campo. Requisito atendido.')
    setVerifyOpen(false)
  }

  const handleReject = async () => {
    if (!plan) return
    await rejectVerification(plan.id, verificationNote || 'Correção incompleta — refazer o serviço.')
    setVerifyOpen(false)
  }

  return (
    <>
      <Drawer open={!!nc} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="sm:max-w-2xl">
          <DrawerHeader>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[13px] font-600 text-technical-700">{nc.code}</span>
              <SeverityBadge severity={nc.severity} />
              <NCStatusBadge status={nc.status} />
              {nc.origin === 'ai' && (
                <Badge variant="navy">
                  <Bot className="h-3 w-3" />
                  Detectada pela IA
                </Badge>
              )}
            </div>
            <DrawerTitle className="mt-2 font-display text-[19px] font-600 uppercase leading-tight tracking-[0.01em] text-navy-900">
              {nc.title}
            </DrawerTitle>
            <p className="mt-1 text-[13.5px] leading-snug text-graphite-500">{nc.description}</p>
          </DrawerHeader>

          <DrawerBody className="space-y-5">
            <div className="rounded-md border border-border bg-graphite-50 px-4 py-4">
              <FlowTimeline current={stage} />
            </div>

            {/* ficha técnica */}
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[
                { label: 'Bloco', value: nc.blockCode },
                { label: 'Local', value: nc.locationCode },
                { label: 'Responsável', value: nc.responsible },
                { label: 'Aberta em', value: `${formatDate(nc.openedAt)} ${formatTime(nc.openedAt)}` },
                { label: 'Prazo', value: formatDate(nc.deadline) },
                { label: 'Custo estimado', value: nc.cost ? `R$ ${num(nc.cost)}` : '—' },
              ].map((r) => (
                <div key={r.label}>
                  <dt className="tech-label">{r.label}</dt>
                  <dd className="mt-0.5 text-[13.5px] text-graphite-900">{r.value}</dd>
                </div>
              ))}
            </dl>

            {/* norma */}
            <div className="rounded-md border border-technical-300/60 bg-technical-100/50 p-3">
              <div className="flex items-center gap-2">
                <FileWarning className="h-3.5 w-3.5 text-technical-700" />
                <span className="font-mono text-[11px] font-600 uppercase tracking-[0.12em] text-technical-700">
                  {nc.standardRef}
                </span>
              </div>
              <p className="mt-1 text-[13px] text-graphite-600">{nc.standardTitle}</p>
            </div>

            {nc.recurrenceOf && (
              <div className="flex items-center gap-2 rounded-md border border-status-warning/30 bg-status-warning-bg px-3 py-2.5">
                <Repeat2 className="h-4 w-4 shrink-0 text-status-warning" />
                <p className="text-[13px] text-graphite-700">
                  Reincidência da <span className="font-mono font-600">{nc.recurrenceOf}</span> — mesmo local, mesmo requisito.
                </p>
              </div>
            )}

            {/* evidências */}
            <div>
              <p className="tech-label mb-2">Evidências ({ncEvidences.length})</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {ncEvidences.map((e) => (
                  <figure key={e.id} className="overflow-hidden rounded-[3px] border border-border">
                    <div className="aspect-[4/3]">
                      <EvidenciaImage evidenciaId={e.id} fallbackVariant={e.sceneVariant} compact />
                    </div>
                    <figcaption className="truncate bg-white px-1.5 py-1 font-mono text-[9px] uppercase tracking-[0.06em] text-graphite-400">
                      {e.code}
                    </figcaption>
                  </figure>
                ))}
                {ncEvidences.length === 0 && (
                  <p className="col-span-full rounded-[3px] border border-dashed border-graphite-200 px-3 py-4 text-center text-[12.5px] text-graphite-400">
                    Nenhuma evidência anexada ainda.
                  </p>
                )}
              </div>
            </div>

            {/* plano de ação */}
            {plan ? (
              <div className="rounded-md border border-border">
                <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-graphite-400">{plan.code}</p>
                    <p className="font-display text-[15px] font-600 uppercase tracking-[0.04em] text-navy-900">{plan.title}</p>
                  </div>
                  <Badge variant={plan.status === 'done' ? 'success' : plan.status === 'verification' ? 'info' : 'warning'}>
                    {plan.status === 'done' ? 'Concluída' : plan.status === 'verification' ? 'Em verificação' : 'Em execução'}
                  </Badge>
                </div>
                <div className="space-y-3 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Progress value={plan.progress} className="h-1.5" />
                    <span className="shrink-0 font-mono text-[11.5px] tabular-nums text-graphite-500">{plan.progress}%</span>
                  </div>
                  <dl className="grid grid-cols-2 gap-3">
                    <div>
                      <dt className="tech-label">Executor</dt>
                      <dd className="text-[13px] text-graphite-900">{plan.executor}</dd>
                    </div>
                    <div>
                      <dt className="tech-label">Causa raiz</dt>
                      <dd className="text-[13px] text-graphite-600">{plan.rootCause}</dd>
                    </div>
                  </dl>
                  <EventTimeline events={plan.timeline} />
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-graphite-200 px-4 py-6 text-center">
                <ClipboardList className="mx-auto h-6 w-6 text-graphite-300" />
                <p className="mt-2 text-[13.5px] text-graphite-500">
                  Esta não conformidade ainda não tem plano de ação designado.
                </p>
              </div>
            )}
          </DrawerBody>

          <DrawerFooter>
            {nc.alertId && (
              <Button asChild variant="ghost" size="sm">
                <Link to={`/alerts/${nc.alertId}`}>
                  <Camera className="h-3.5 w-3.5" />
                  Ver detecção
                </Link>
              </Button>
            )}

            {!plan && nc.status !== 'resolved' && (
              <Button size="sm" onClick={() => setPlanOpen(true)}>
                <ClipboardList className="h-4 w-4" />
                Criar plano de ação
              </Button>
            )}

            {plan && plan.status === 'in_progress' && (
              <>
                <input
                  ref={inputArquivoRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,video/mp4,application/pdf"
                  className="hidden"
                  onChange={handleArquivoSelecionado}
                />
                <Button variant="outline" size="sm" onClick={handleAttachClick}>
                  <Paperclip className="h-3.5 w-3.5" />
                  Anexar evidência
                </Button>
                <Button size="sm" onClick={handleSend}>
                  <Send className="h-3.5 w-3.5" />
                  Enviar para verificação
                </Button>
              </>
            )}

            {plan && plan.status === 'verification' && (
              <Button variant="success" size="sm" onClick={() => setVerifyOpen(true)}>
                <CheckCircle2 className="h-4 w-4" />
                Verificar e fechar
              </Button>
            )}

            {nc.status === 'resolved' && (
              <span className="flex items-center gap-2 font-mono text-[11.5px] uppercase tracking-[0.1em] text-status-success">
                <CheckCircle2 className="h-4 w-4" />
                Encerrada {nc.closedAt ? `em ${formatDate(nc.closedAt)}` : ''}
              </span>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* criar plano de ação */}
      <Dialog open={planOpen} onOpenChange={setPlanOpen}>
        <DialogContent className="max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Novo plano de ação</DialogTitle>
            <DialogDescription>Vinculado à {nc.code} · {nc.standardRef}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-5 py-4">
            <div>
              <label className="tech-label mb-1.5 block">Título da ação</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="tech-label mb-1.5 block">Descrição do serviço</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Ex.: reinstalar guarda-corpo a 1,20 m, travessa a 0,70 m e rodapé de 0,20 m."
              />
            </div>
            <div>
              <label className="tech-label mb-1.5 block">Causa raiz</label>
              <Input
                value={form.rootCause}
                onChange={(e) => setForm({ ...form, rootCause: e.target.value })}
                placeholder="Ex.: frente liberada antes da proteção coletiva."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="tech-label mb-1.5 block">Executor</label>
                <Input value={form.executor} disabled />
                <p className="mt-1 text-[10.5px] text-graphite-400">
                  Fixo nesta demo (sem tela de login) — precisa ser o mesmo usuário para poder concluir a ação depois.
                </p>
              </div>
              <div>
                <label className="tech-label mb-1.5 block">Prazo</label>
                <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
              </div>
              <div>
                <label className="tech-label mb-1.5 block">Custo (R$)</label>
                <Input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setPlanOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreatePlan}>Criar e notificar executor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* verificação */}
      <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
        <DialogContent className="max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Verificação da ação corretiva</DialogTitle>
            <DialogDescription>
              A verificação é feita por um engenheiro diferente de quem executou — é o que sustenta o fechamento numa auditoria.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-5 py-4">
            <div className="grid grid-cols-2 gap-3">
              <figure>
                <figcaption className="tech-label mb-1.5">Antes</figcaption>
                <div className="aspect-video overflow-hidden rounded-[3px] border border-border">
                  <CameraScene variant="slab" compact />
                </div>
              </figure>
              <figure>
                <figcaption className="tech-label mb-1.5">Depois</figcaption>
                <div className="aspect-video overflow-hidden rounded-[3px] border border-status-success/40">
                  <CameraScene variant="facade" compact />
                </div>
              </figure>
            </div>

            <div>
              <label className="tech-label mb-1.5 block">Parecer do verificador</label>
              <Textarea
                value={verificationNote}
                onChange={(e) => setVerificationNote(e.target.value)}
                placeholder="Ex.: proteção coletiva conferida em campo, medidas conforme NR-18. Ocorrência encerrada."
              />
            </div>

            <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-graphite-400">
              Verificador: {usuarioDemo()?.nome ?? 'usuário atual'}
            </p>
            {plan?.executor === usuarioDemo()?.nome && (
              <p className="rounded-[3px] border border-status-warning/30 bg-status-warning-bg px-3 py-2 text-[12px] text-graphite-600">
                Esta demo usa um único usuário fixo, que também é o executor desta ação. O backend vai recusar a
                verificação (regra de segregação de função) — é o comportamento correto sendo demonstrado, não um erro.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleReject}>
              <ThumbsDown className="h-3.5 w-3.5" />
              Reprovar
            </Button>
            <Button variant="success" onClick={handleApprove}>
              <CheckCircle2 className="h-4 w-4" />
              Aprovar e fechar NC
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
