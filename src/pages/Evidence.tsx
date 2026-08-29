import * as React from 'react'
import { Camera, FileText, Film, Image as ImageIcon, ShieldCheck } from 'lucide-react'
import { PageBody, PageHeader } from '@/components/shared/PageHeader'
import { CameraScene } from '@/components/cameras/CameraScene'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppStore } from '@/store/AppStore'
import { cn, formatDate, formatTime } from '@/lib/utils'
import type { Evidence, EvidenceKind } from '@/types'

const kindMeta: Record<EvidenceKind, { label: string; icon: typeof Camera; tone: string }> = {
  photo: { label: 'Foto', icon: ImageIcon, tone: 'text-technical-600' },
  video: { label: 'Vídeo', icon: Film, tone: 'text-status-warning' },
  camera: { label: 'Câmera', icon: Camera, tone: 'text-status-critical' },
  document: { label: 'Documento', icon: FileText, tone: 'text-graphite-500' },
}

export default function EvidencePage() {
  const { evidences } = useAppStore()
  const [kind, setKind] = React.useState<EvidenceKind | 'all'>('all')
  const [selected, setSelected] = React.useState<Evidence | null>(null)

  const filtered = evidences.filter((e) => kind === 'all' || e.kind === kind)

  return (
    <>
      <PageHeader
        eyebrow="Rastreabilidade · Acervo da obra"
        title="Evidências"
        description="Todo registro fica vinculado à ocorrência, ao autor e a um hash de integridade — é o que sustenta a auditoria."
        meta={[
          { label: 'Registros', value: String(evidences.length) },
          { label: 'Integridade', value: 'SHA-256' },
        ]}
      />

      <PageBody className="space-y-5">
        <Tabs value={kind} onValueChange={(v) => setKind(v as EvidenceKind | 'all')}>
          <TabsList>
            <TabsTrigger value="all">Todas · {evidences.length}</TabsTrigger>
            {(Object.keys(kindMeta) as EvidenceKind[]).map((k) => (
              <TabsTrigger key={k} value={k}>
                {kindMeta[k].label} · {evidences.filter((e) => e.kind === k).length}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((e) => {
            const meta = kindMeta[e.kind]
            const Icon = meta.icon
            return (
              <button
                key={e.id}
                onClick={() => setSelected(e)}
                className="group flex flex-col overflow-hidden rounded-md border border-border bg-card text-left shadow-panel transition-all hover:border-technical-400 hover:shadow-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <CameraScene variant={e.sceneVariant} compact className="transition-transform duration-500 group-hover:scale-[1.03]" />
                  <span className="absolute left-2 top-2 flex items-center gap-1.5 rounded-[2px] bg-navy-950/75 px-1.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-white backdrop-blur-[2px]">
                    <Icon className="h-3 w-3" />
                    {meta.label}
                  </span>
                  <span className="absolute right-2 top-2 rounded-[2px] bg-navy-950/75 px-1.5 py-1 font-mono text-[9.5px] tracking-[0.06em] text-white/80 backdrop-blur-[2px]">
                    {e.code}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-3">
                  <p className="text-[13.5px] font-500 leading-snug text-graphite-900">{e.title}</p>
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-graphite-400">
                    {e.blockCode} · {e.locationLabel}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    <span className="font-mono text-[10.5px] text-graphite-400">
                      {formatDate(e.capturedAt)} {formatTime(e.capturedAt)}
                    </span>
                    <Badge variant={e.relatedType === 'NC' ? 'critical' : e.relatedType === 'PA' ? 'warning' : 'info'}>
                      {e.relatedCode}
                    </Badge>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <Card>
            <CardContent className="py-16 text-center text-[13px] text-graphite-400">
              Nenhuma evidência deste tipo.
            </CardContent>
          </Card>
        )}
      </PageBody>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-[860px] overflow-hidden p-0">
          {selected && (
            <>
              <div className="aspect-video w-full bg-navy-950">
                <CameraScene variant={selected.sceneVariant} />
              </div>
              <div className="space-y-4 px-5 py-4">
                <div>
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-graphite-400">{selected.code}</p>
                  <h2 className="mt-0.5 font-display text-[17.5px] font-600 uppercase tracking-[0.02em] text-navy-900">
                    {selected.title}
                  </h2>
                </div>
                <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { label: 'Tipo', value: kindMeta[selected.kind].label },
                    { label: 'Autor', value: selected.author },
                    { label: 'Local', value: selected.locationLabel },
                    { label: 'Vinculada a', value: selected.relatedCode },
                    { label: 'Capturada em', value: `${formatDate(selected.capturedAt)} ${formatTime(selected.capturedAt)}` },
                    { label: 'Tamanho', value: selected.sizeLabel },
                    { label: 'Hash', value: selected.hash },
                  ].map((r) => (
                    <div key={r.label}>
                      <dt className="tech-label">{r.label}</dt>
                      <dd className="tech-value text-[13px]">{r.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className={cn('flex items-center gap-2 border-t border-border pt-3 text-[12.5px] text-graphite-500')}>
                  <ShieldCheck className="h-4 w-4 text-status-success" />
                  Integridade verificada — o hash confirma que o arquivo não foi alterado depois do registro.
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
