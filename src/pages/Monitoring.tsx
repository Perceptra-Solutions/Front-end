import * as React from 'react'
import { Link } from 'react-router-dom'
import { Grid2X2, Grid3X3, LayoutGrid, Maximize2 } from 'lucide-react'
import { PageBody, PageHeader } from '@/components/shared/PageHeader'
import { CameraTile } from '@/components/cameras/CameraTile'
import { DetectionFrame } from '@/components/cameras/DetectionFrame'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusDot } from '@/components/shared/StatusBadge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cameras } from '@/data/cameras'
import { useAppStore } from '@/store/AppStore'
import { cn, formatDate, formatTime } from '@/lib/utils'
import type { Camera } from '@/types'

const layouts = [
  { key: '2', label: '2×', icon: Grid2X2, cls: 'sm:grid-cols-2' },
  { key: '3', label: '3×', icon: Grid3X3, cls: 'sm:grid-cols-2 xl:grid-cols-3' },
  { key: '4', label: '4×', icon: LayoutGrid, cls: 'sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' },
]

export default function Monitoring() {
  const { alerts } = useAppStore()
  const [layout, setLayout] = React.useState('3')
  const [block, setBlock] = React.useState('all')
  const [selected, setSelected] = React.useState<Camera | null>(null)

  const blocks = Array.from(new Set(cameras.map((c) => c.blockCode)))
  const list = cameras.filter((c) => block === 'all' || c.blockCode === block)
  const grid = layouts.find((l) => l.key === layout)!

  const lastAlertOf = (cameraId: string) => alerts.find((a) => a.cameraId === cameraId)
  const selectedAlert = selected ? lastAlertOf(selected.id) : undefined

  return (
    <>
      <PageHeader
        eyebrow="Operação · Mural de câmeras"
        title="Monitoramento"
        description="Transmissão das câmeras do canteiro com a inferência dos modelos aplicada em tempo real."
        meta={[
          { label: 'Online', value: `${cameras.filter((c) => c.status === 'online').length} / ${cameras.length}` },
          { label: 'Protocolo', value: 'RTSP · H.265' },
        ]}
        actions={
          <div className="flex items-center gap-1 rounded-[3px] border border-graphite-200 p-0.5">
            {layouts.map((l) => (
              <button
                key={l.key}
                onClick={() => setLayout(l.key)}
                className={cn(
                  'flex h-7 items-center gap-1 rounded-[2px] px-2 font-mono text-[10.5px] transition-colors',
                  layout === l.key ? 'bg-navy-800 text-white' : 'text-graphite-500 hover:bg-graphite-100',
                )}
                aria-label={`Layout ${l.label}`}
              >
                <l.icon className="h-3.5 w-3.5" />
                {l.label}
              </button>
            ))}
          </div>
        }
      />

      <PageBody className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={block} onValueChange={setBlock}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Bloco" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os blocos</SelectItem>
              {blocks.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-graphite-400">
            {list.length} câmeras exibidas
          </span>
        </div>

        <div className={cn('grid gap-4', grid.cls)}>
          {list.map((c) => (
            <CameraTile key={c.id} camera={c} lastAlert={lastAlertOf(c.id)} onOpen={setSelected} />
          ))}
        </div>
      </PageBody>

      {/* visualização ampliada */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-[1080px] overflow-hidden p-0">
          {selected && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
                <div>
                  <p className="font-display text-[15.5px] font-600 uppercase tracking-[0.03em] text-navy-900">
                    {selected.code} · {selected.name}
                  </p>
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-graphite-400">
                    {selected.blockCode} · {selected.locationCode} · {selected.ip}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusDot tone={selected.status} />
                  <Badge variant="navy">{selected.aiModelCode}</Badge>
                </div>
              </div>

              {selected.status === 'online' ? (
                <DetectionFrame
                  variant={selected.sceneVariant}
                  boxes={selectedAlert?.boxes}
                  cameraCode={selected.code}
                  locationLabel={selected.locationLabel}
                  timestamp={selected.lastDetectionAt}
                  live
                  className="aspect-video w-full"
                />
              ) : (
                <div className="flex aspect-video w-full items-center justify-center bg-navy-950 blueprint-grid-dark">
                  <span className="font-mono text-[12px] uppercase tracking-[0.16em] text-white/40">Sem sinal desta câmera</span>
                </div>
              )}

              <div className="grid gap-4 px-5 py-4 sm:grid-cols-4">
                {[
                  { label: 'Resolução', value: selected.resolution },
                  { label: 'Taxa', value: `${selected.fps} fps` },
                  { label: 'Uptime', value: `${selected.uptimeDays} d` },
                  { label: 'Alertas hoje', value: String(selected.alertsToday) },
                ].map((m) => (
                  <div key={m.label}>
                    <p className="tech-label">{m.label}</p>
                    <p className="tech-value text-[14px]">{m.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3">
                <p className="font-mono text-[11px] text-graphite-400">
                  Última detecção · {formatDate(selected.lastDetectionAt)} {formatTime(selected.lastDetectionAt)}
                </p>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/map">
                      <Maximize2 className="h-3.5 w-3.5" />
                      Ver na planta
                    </Link>
                  </Button>
                  {selectedAlert && (
                    <Button asChild size="sm">
                      <Link to={`/alerts/${selectedAlert.id}`}>Abrir última ocorrência</Link>
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
