import * as React from 'react'
import { Link } from 'react-router-dom'
import { Layers, MapPin } from 'lucide-react'
import { PageBody, PageHeader } from '@/components/shared/PageHeader'
import { SitePlan, zones } from '@/components/map/SitePlan'
import { DetectionFrame } from '@/components/cameras/DetectionFrame'
import { Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusDot } from '@/components/shared/StatusBadge'
import { SeverityBadge } from '@/components/shared/StatusBadge'
import { cameras } from '@/data/cameras'
import { currentWork } from '@/data/works'
import { useAppStore } from '@/store/AppStore'
import { formatDate, formatTime } from '@/lib/utils'
import type { Camera } from '@/types'

export default function ConstructionMap() {
  const { alerts } = useAppStore()
  const [selected, setSelected] = React.useState<Camera | null>(null)

  const pending = alerts.filter((a) => a.status === 'pending')
  const alertCountByCamera = pending.reduce<Record<string, number>>((acc, a) => {
    acc[a.cameraId] = (acc[a.cameraId] ?? 0) + 1
    return acc
  }, {})

  const selectedAlerts = selected ? alerts.filter((a) => a.cameraId === selected.id) : []

  return (
    <>
      <PageHeader
        eyebrow="Implantação · Planta do canteiro"
        title="Mapa da obra"
        description="Setores, áreas restritas e o posicionamento das câmeras sobre a implantação do canteiro."
        meta={[
          { label: 'Escala', value: '1:500' },
          { label: 'Prancha', value: 'IMP-01' },
          { label: 'Coordenadas', value: currentWork.coordinates },
        ]}
      />

      <PageBody className="space-y-5">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          <Card className="min-w-0 overflow-hidden">
            <CardHeader>
              <CardTitle>Implantação · Residencial Horizonte</CardTitle>
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-graphite-400">
                  <span className="h-2 w-2 rounded-full bg-technical-600" /> câmera ativa
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-graphite-400">
                  <span className="h-2 w-2 animate-pulse-live rounded-full bg-status-critical" /> com alerta
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-graphite-400">
                  <span className="h-2 w-2 rounded-full bg-status-warning" /> manutenção
                </span>
              </div>
            </CardHeader>
            <div className="p-3">
              <SitePlan
                cameras={cameras}
                alertCountByCamera={alertCountByCamera}
                selectedId={selected?.id}
                onSelect={setSelected}
              />
            </div>
          </Card>

          <div className="flex min-w-0 flex-col gap-5">
            <Card>
              <CardHeader>
                <CardTitle>Setores</CardTitle>
                <Layers className="h-4 w-4 text-graphite-300" />
              </CardHeader>
              <div className="divide-y divide-border">
                {zones.map((z) => {
                  const zoneCameras = cameras.filter((c) => c.locationCode === z.code || c.blockCode.includes(z.label.toUpperCase()))
                  return (
                    <div key={z.code} className="flex items-center justify-between gap-3 px-4 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate font-display text-[13.5px] font-600 uppercase tracking-[0.08em] text-navy-900">
                          {z.label}
                        </p>
                        <p className="truncate font-mono text-[10px] uppercase tracking-[0.1em] text-graphite-400">{z.code}</p>
                      </div>
                      <span className="shrink-0 font-mono text-[11.5px] tabular-nums text-graphite-500">
                        {zoneCameras.length} cam
                      </span>
                    </div>
                  )
                })}
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ocorrências no mapa</CardTitle>
                <MapPin className="h-4 w-4 text-graphite-300" />
              </CardHeader>
              <CardContent className="space-y-2.5">
                {pending.slice(0, 4).map((a) => (
                  <Link
                    key={a.id}
                    to={`/alerts/${a.id}`}
                    className="block rounded-[3px] border border-border p-2.5 transition-colors hover:border-technical-300 hover:bg-technical-100/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <SeverityBadge severity={a.severity} />
                      <span className="font-mono text-[10.5px] text-graphite-400">{a.cameraCode}</span>
                    </div>
                    <p className="mt-1.5 text-[13px] font-500 text-graphite-900">{a.title}</p>
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-graphite-400">
                      {a.blockCode} · {a.locationCode}
                    </p>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </PageBody>

      {/* detalhe da câmera */}
      <Drawer open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DrawerContent>
          {selected && (
            <>
              <DrawerHeader>
                <DrawerTitle className="font-display text-[17.5px] font-600 uppercase tracking-[0.03em] text-navy-900">
                  {selected.code} · {selected.name}
                </DrawerTitle>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-graphite-400">
                    {selected.blockCode} · {selected.locationCode}
                  </span>
                  <StatusDot tone={selected.status} />
                </div>
              </DrawerHeader>

              <DrawerBody className="space-y-4">
                {selected.status === 'online' ? (
                  <DetectionFrame
                    variant={selected.sceneVariant}
                    boxes={selectedAlerts[0]?.boxes.slice(0, 2)}
                    cameraCode={selected.code}
                    locationLabel={selected.locationLabel}
                    timestamp={selected.lastDetectionAt}
                    live
                    className="aspect-video w-full rounded-[3px]"
                  />
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center rounded-[3px] bg-navy-950 blueprint-grid-dark">
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">Sem sinal</span>
                  </div>
                )}

                <dl className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Modelo do equipamento', value: selected.model },
                    { label: 'Modelo de IA', value: selected.aiModelCode },
                    { label: 'Resolução', value: selected.resolution },
                    { label: 'Taxa de quadros', value: `${selected.fps} fps` },
                    { label: 'Endereço', value: selected.ip },
                    { label: 'Protocolo', value: selected.protocol },
                    { label: 'Uptime', value: `${selected.uptimeDays} dias` },
                    { label: 'Alertas hoje', value: String(selected.alertsToday) },
                  ].map((r) => (
                    <div key={r.label}>
                      <dt className="tech-label">{r.label}</dt>
                      <dd className="tech-value text-[13px]">{r.value}</dd>
                    </div>
                  ))}
                </dl>

                <div>
                  <p className="tech-label mb-2">Ocorrências desta câmera</p>
                  <div className="space-y-2">
                    {selectedAlerts.length === 0 && (
                      <p className="rounded-[3px] border border-border bg-graphite-50 px-3 py-4 text-center text-[13px] text-graphite-400">
                        Nenhuma ocorrência registrada hoje.
                      </p>
                    )}
                    {selectedAlerts.map((a) => (
                      <Link
                        key={a.id}
                        to={`/alerts/${a.id}`}
                        className="flex items-center justify-between gap-3 rounded-[3px] border border-border px-3 py-2 transition-colors hover:border-technical-300"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-500 text-graphite-900">{a.title}</p>
                          <p className="font-mono text-[10.5px] text-graphite-400">
                            {formatDate(a.detectedAt)} {formatTime(a.detectedAt)} · {a.confidence.toFixed(1)}%
                          </p>
                        </div>
                        <Badge variant={a.severity === 'critical' ? 'critical' : a.severity === 'warning' ? 'warning' : 'info'}>
                          {a.status === 'pending' ? 'Triagem' : a.status === 'confirmed' ? 'NC' : 'Descartada'}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              </DrawerBody>

              <DrawerFooter>
                <Button asChild variant="outline" size="sm">
                  <Link to="/cameras">Ficha da câmera</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/monitoring">Abrir no mural</Link>
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  )
}
