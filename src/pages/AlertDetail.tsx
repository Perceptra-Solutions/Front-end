import * as React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Bot, CheckCircle2, Eye, EyeOff, Radar, ShieldAlert, ThumbsDown, UserCheck } from 'lucide-react'
import { PageBody, PageHeader } from '@/components/shared/PageHeader'
import { FlowTimeline } from '@/components/shared/FlowTimeline'
import { DetectionFrame } from '@/components/cameras/DetectionFrame'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input, Textarea } from '@/components/ui/input'
import { SeverityBadge, AlertStatusBadge } from '@/components/shared/StatusBadge'
import { useAppStore } from '@/store/AppStore'
import { usuarioDemo } from '@/lib/api/client'
import { categoryLabel } from '@/components/alerts/AlertCard'
import { getModelByCode } from '@/data/aiModels'
import { cn, formatDate, formatTime } from '@/lib/utils'
import type { Severity } from '@/types'

const dismissReasons = [
  'Sombra ou reflexo interpretado como objeto',
  'Sujeira na lente da câmera',
  'Elemento provisório da obra',
  'EPI presente, fora do ângulo da câmera',
  'Área liberada por permissão de trabalho',
]

export default function AlertDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { alerts, nonConformities, confirmAlert, dismissAlert } = useAppStore()

  const alert = alerts.find((a) => a.id === id || a.code === id)
  const [showBoxes, setShowBoxes] = React.useState(true)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [dismissOpen, setDismissOpen] = React.useState(false)
  const [severity, setSeverity] = React.useState<Severity>('critical')
  const [reason, setReason] = React.useState(dismissReasons[0])
  const [note, setNote] = React.useState('')

  React.useEffect(() => {
    if (alert) setSeverity(alert.severity)
  }, [alert])

  if (!alert) {
    return (
      <PageBody>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <ShieldAlert className="h-8 w-8 text-graphite-300" />
            <p className="text-graphite-500">Ocorrência não encontrada.</p>
            <Button asChild variant="outline" size="sm">
              <Link to="/alerts">Voltar à central de alertas</Link>
            </Button>
          </CardContent>
        </Card>
      </PageBody>
    )
  }

  const model = getModelByCode(alert.modelCode)
  const linkedNC = nonConformities.find((n) => n.id === alert.nonConformityId)
  const stage = alert.status === 'pending' ? 'triage' : alert.status === 'confirmed' ? 'nonconformity' : 'triage'
  const aboveThreshold = model ? alert.confidence / 100 >= model.threshold : true

  const handleConfirm = async () => {
    await confirmAlert(alert.id, { severity, responsible: usuarioDemo()?.nome ?? '', deadline: '' })
    setConfirmOpen(false)
  }

  const handleDismiss = async () => {
    await dismissAlert(alert.id, reason)
    setDismissOpen(false)
  }

  return (
    <>
      <PageHeader
        eyebrow={`Análise de detecção · ${alert.code}`}
        title={alert.title}
        description={alert.description}
        meta={[
          { label: 'Câmera', value: alert.cameraCode },
          { label: 'Local', value: alert.locationCode },
          { label: 'Horário', value: formatTime(alert.detectedAt) },
        ]}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/alerts">
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar
            </Link>
          </Button>
        }
      />

      <PageBody className="space-y-6">
        {/* ciclo da ocorrência */}
        <Card>
          <CardContent className="py-5">
            <FlowTimeline current={stage} />
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,1fr)]">
          {/* imagem + detecção */}
          <div className="min-w-0 space-y-4">
            <section className="overflow-hidden rounded-md border border-border bg-navy-950 shadow-panel">
              <div className="flex items-center justify-between gap-3 border-b border-navy-700/60 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Radar className="h-3.5 w-3.5 text-technical-400" />
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-white/70">
                    Saída do detector · {alert.modelCode}
                  </span>
                </div>
                <button
                  onClick={() => setShowBoxes((v) => !v)}
                  className="flex items-center gap-1.5 rounded-[2px] border border-white/15 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/70 transition-colors hover:border-technical-400 hover:text-white"
                >
                  {showBoxes ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {showBoxes ? 'Ocultar caixas' : 'Mostrar caixas'}
                </button>
              </div>

              <DetectionFrame
                variant={alert.sceneVariant}
                boxes={alert.boxes}
                cameraCode={alert.cameraCode}
                locationLabel={alert.locationLabel}
                timestamp={alert.detectedAt}
                showBoxes={showBoxes}
                scanning={alert.status === 'pending'}
                className="aspect-video w-full"
              />

              {/* classes detectadas */}
              <div className="border-t border-navy-700/60 px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">Objetos identificados no frame</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {alert.boxes.map((b, i) => (
                    <li
                      key={`${b.label}-${i}`}
                      className="flex items-center gap-2 rounded-[2px] border border-white/12 bg-white/[0.05] px-2 py-1"
                    >
                      <span
                        className={cn(
                          'h-2 w-2 rounded-[1px]',
                          b.tone === 'critical' && 'bg-[#FF5A4E]',
                          b.tone === 'warning' && 'bg-[#F2A93B]',
                          b.tone === 'info' && 'bg-[#5FB0F0]',
                          b.tone === 'neutral' && 'bg-[#9FB4C6]',
                        )}
                      />
                      <span className="font-mono text-[11px] text-white/85">{b.label}</span>
                      <span className="font-mono text-[11px] tabular-nums text-white/50">{b.confidence.toFixed(1)}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* leitura do modelo */}
            <Card>
              <CardHeader>
                <CardTitle>Como o modelo chegou nesta conclusão</CardTitle>
                <Badge variant={aboveThreshold ? 'critical' : 'default'}>
                  {aboveThreshold ? 'Acima do limiar' : 'Abaixo do limiar'}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <span className="tech-label">Confiança da detecção</span>
                    <span className="font-mono text-[13px] tabular-nums text-graphite-500">
                      limiar {model ? (model.threshold * 100).toFixed(0) : '80'}%
                    </span>
                  </div>
                  <div className="relative h-8 overflow-hidden rounded-[3px] bg-graphite-100">
                    <div
                      className="h-full bg-status-critical/85 transition-[width] duration-700"
                      style={{ width: `${alert.confidence}%` }}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[14px] font-600 tabular-nums text-white">
                      {alert.confidence.toFixed(1).replace('.', ',')}%
                    </span>
                    {model && (
                      <span
                        className="absolute top-0 h-full border-l-2 border-dashed border-navy-900/50"
                        style={{ left: `${model.threshold * 100}%` }}
                      />
                    )}
                  </div>
                </div>

                <p className="text-[13.5px] leading-relaxed text-graphite-600">
                  O modelo <span className="font-500 text-graphite-900">{alert.modelName} {alert.modelVersion}</span> classificou o
                  frame como <span className="font-500 text-graphite-900">{alert.detectionClass}</span>. A detecção ficou acima do
                  limiar configurado, então entrou na fila de triagem — mas nenhuma não conformidade é aberta sem a decisão de um
                  engenheiro.
                </p>

                <div className="grid grid-cols-2 gap-4 border-t border-border pt-3 sm:grid-cols-4">
                  {[
                    { label: 'Precisão', value: model ? `${model.precision}%` : '—' },
                    { label: 'Recall', value: model ? `${model.recall}%` : '—' },
                    { label: 'Falsos positivos', value: model ? `${model.falsePositiveRate}%` : '—' },
                    { label: 'Latência', value: model ? `${model.latencyMs} ms` : '—' },
                  ].map((m) => (
                    <div key={m.label}>
                      <p className="tech-label">{m.label}</p>
                      <p className="tech-value text-[14px]">{m.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* painel lateral */}
          <div className="flex min-w-0 flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Detalhe da detecção</CardTitle>
                <AlertStatusBadge status={alert.status} />
              </CardHeader>
              <CardContent>
                <dl className="divide-y divide-border">
                  {[
                    { label: 'Classe', value: alert.detectionClass },
                    { label: 'Categoria', value: categoryLabel[alert.category] },
                    { label: 'Modelo', value: `${alert.modelName} ${alert.modelVersion}` },
                    { label: 'Confiança', value: `${alert.confidence.toFixed(1).replace('.', ',')}%` },
                    { label: 'Câmera', value: `${alert.cameraCode} · ${alert.locationLabel}` },
                    { label: 'Bloco', value: alert.blockCode },
                    { label: 'Local', value: alert.locationCode },
                    { label: 'Data', value: formatDate(alert.detectedAt) },
                    { label: 'Horário', value: formatTime(alert.detectedAt) },
                    { label: 'Norma aplicável', value: alert.standardRef },
                  ].map((row) => (
                    <div key={row.label} className="flex items-baseline justify-between gap-4 py-2">
                      <dt className="tech-label">{row.label}</dt>
                      <dd className="text-right font-mono text-[12.5px] text-graphite-900">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>

            {/* decisão do engenheiro */}
            {alert.status === 'pending' ? (
              <Card className="border-technical-300">
                <CardHeader className="bg-technical-100/60">
                  <CardTitle className="text-technical-700">Decisão do engenheiro</CardTitle>
                  <UserCheck className="h-4 w-4 text-technical-600" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-stretch gap-3 rounded-[3px] border border-border bg-graphite-50 p-3">
                    <div className="flex flex-1 flex-col items-center gap-1 text-center">
                      <Bot className="h-4 w-4 text-technical-600" />
                      <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-graphite-400">IA</p>
                      <p className="font-display text-[12px] font-600 uppercase tracking-[0.08em] text-graphite-700">Recomendação</p>
                    </div>
                    <span className="w-px bg-border" />
                    <div className="flex flex-1 flex-col items-center gap-1 text-center">
                      <UserCheck className="h-4 w-4 text-navy-800" />
                      <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-graphite-400">Engenheiro</p>
                      <p className="font-display text-[12px] font-600 uppercase tracking-[0.08em] text-navy-900">Decisão</p>
                    </div>
                  </div>

                  <p className="text-center text-[14px] font-500 text-graphite-700">
                    Esta detecção representa uma ocorrência real?
                  </p>

                  <div className="flex flex-col gap-2">
                    <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
                      <CheckCircle2 className="h-4 w-4" />
                      Confirmar ocorrência
                    </Button>
                    <Button variant="outline" onClick={() => setDismissOpen(true)}>
                      <ThumbsDown className="h-4 w-4" />
                      Falso positivo
                    </Button>
                  </div>

                  <p className="text-center font-mono text-[10px] uppercase tracking-[0.1em] text-graphite-400">
                    Registrado em nome de {usuarioDemo()?.nome ?? 'usuário atual'}
                    {usuarioDemo()?.crea ? ` · CREA ${usuarioDemo()?.crea}` : ''}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className={alert.status === 'confirmed' ? 'border-status-success/40' : ''}>
                <CardHeader className={alert.status === 'confirmed' ? 'bg-status-success-bg' : 'bg-graphite-50'}>
                  <CardTitle className={alert.status === 'confirmed' ? 'text-status-success' : ''}>
                    {alert.status === 'confirmed' ? 'Ocorrência confirmada' : 'Descartada na triagem'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-[13.5px] text-graphite-600">
                    Triagem feita por <span className="font-500 text-graphite-900">{alert.reviewedBy}</span>
                    {alert.reviewedAt && ` em ${formatDate(alert.reviewedAt)} às ${formatTime(alert.reviewedAt)}`}.
                  </p>

                  {linkedNC ? (
                    <div className="rounded-[3px] border border-border bg-graphite-50 p-3">
                      <p className="tech-label">Não conformidade gerada</p>
                      <p className="mt-1 font-mono text-[15px] font-600 text-technical-700">{linkedNC.code}</p>
                      <p className="mt-0.5 text-[13px] text-graphite-600">{linkedNC.title}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <SeverityBadge severity={linkedNC.severity} />
                        <span className="font-mono text-[11px] text-graphite-400">prazo {formatDate(linkedNC.deadline)}</span>
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        className="mt-3 w-full"
                        onClick={() => navigate('/non-conformities')}
                      >
                        Abrir não conformidade
                      </Button>
                    </div>
                  ) : (
                    <p className="rounded-[3px] border border-border bg-graphite-50 p-3 text-[13px] text-graphite-500">
                      Nenhuma NC aberta. A detecção foi para a base de retreino do modelo {alert.modelCode}.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </PageBody>

      {/* confirmação */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Confirmar ocorrência</DialogTitle>
            <DialogDescription>
              A confirmação abre uma não conformidade vinculada à detecção {alert.code} e à norma {alert.standardRef}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-5 py-4">
            <div>
              <label className="tech-label mb-1.5 block">Severidade</label>
              <Select value={severity} onValueChange={(v) => setSeverity(v as Severity)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Crítica</SelectItem>
                  <SelectItem value="warning">Média</SelectItem>
                  <SelectItem value="info">Baixa</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-1.5 text-[10.5px] text-graphite-400">
                O prazo de correção é calculado automaticamente pela severidade (SLA: crítica 24h, média 7d, baixa 15d).
              </p>
            </div>

            <div>
              <label className="tech-label mb-1.5 block">Responsável pela correção</label>
              <Input value={usuarioDemo()?.nome ?? '—'} disabled />
              <p className="mt-1.5 text-[10.5px] text-graphite-400">Fixo nesta demo (sem tela de login).</p>
            </div>

            <div>
              <label className="tech-label mb-1.5 block">Parecer técnico (opcional)</label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex.: confirmado em vistoria presencial às 17h45, frente de serviço interditada."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirm}>
              <CheckCircle2 className="h-4 w-4" />
              Abrir não conformidade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* falso positivo */}
      <Dialog open={dismissOpen} onOpenChange={setDismissOpen}>
        <DialogContent className="max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Registrar falso positivo</DialogTitle>
            <DialogDescription>
              O motivo alimenta a base de retreino do modelo {alert.modelCode} — é assim que a IA melhora.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-5 py-4">
            <div>
              <label className="tech-label mb-1.5 block">Motivo do descarte</label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dismissReasons.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDismissOpen(false)}>
              Cancelar
            </Button>
            <Button variant="secondary" onClick={handleDismiss}>
              <ThumbsDown className="h-4 w-4" />
              Descartar detecção
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
