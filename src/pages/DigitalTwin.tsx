import * as React from 'react'
import { Link } from 'react-router-dom'
import { Boxes, Camera, MousePointer2, TriangleAlert } from 'lucide-react'
import { PageBody, PageHeader } from '@/components/shared/PageHeader'
import { HologramBuilding, type FloorInfo, type TwinPhase } from '@/components/twin/HologramBuilding'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/store/AppStore'
import { cameras } from '@/data/cameras'
import { currentWork } from '@/data/works'
import { cn } from '@/lib/utils'

const FLOORS = 12

export default function DigitalTwin() {
  const { alerts, nonConformities } = useAppStore()
  const [hovered, setHovered] = React.useState<string | null>(null)
  const [phase, setPhase] = React.useState<TwinPhase>('plan')
  const [built, setBuilt] = React.useState(0)

  /** um registro por pavimento do Bloco A, cruzando NCs e alertas pendentes */
  const floors: FloorInfo[] = React.useMemo(() => {
    return Array.from({ length: FLOORS }, (_, i) => {
      const index = i + 1
      const code = `PV-${String(index).padStart(2, '0')}`
      return {
        code,
        index,
        ncCount: nonConformities.filter((n) => n.locationCode === code && n.status !== 'resolved' && n.blockCode === 'BLOCO A')
          .length,
        alertCount: alerts.filter((a) => a.locationCode === code && a.status === 'pending' && a.blockCode === 'BLOCO A').length,
      }
    })
  }, [alerts, nonConformities])

  const handlePhase = React.useCallback((p: TwinPhase, b: number) => {
    setPhase(p)
    setBuilt(b)
  }, [])

  const withNC = floors.filter((f) => f.ncCount > 0).length
  const blockCameras = cameras.filter((c) => c.blockCode === 'BLOCO A')

  return (
    <>
      <PageHeader
        eyebrow="Gêmeo digital · Modelo volumétrico"
        title="Bloco A em 3D"
        description="Modelo 3D em WebGL na escala real da obra: a estrutura sobe da fundação à cobertura e marca, pavimento a pavimento, onde a operação tem ocorrência aberta."
        meta={[
          { label: 'Pavimentos', value: `${FLOORS}` },
          { label: 'Pé-direito', value: '3,00 m' },
          { label: 'Altura total', value: '40,60 m' },
        ]}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/map">Ver planta 2D</Link>
          </Button>
        }
      />

      <PageBody className="space-y-5">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          {/* maquete */}
          <Card className="min-w-0 overflow-hidden">
            <CardHeader>
              <CardTitle>Maquete holográfica</CardTitle>
              <span className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-graphite-400">
                <MousePointer2 className="h-3.5 w-3.5" />
                mova o mouse sobre o modelo para girar · scroll aproxima
              </span>
            </CardHeader>
            <HologramBuilding
              floors={floors}
              highlighted={hovered}
              onPhaseChange={handlePhase}
              className="h-[520px] w-full lg:h-[620px]"
            />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
              <div className="flex items-center gap-3">
                <Progress
                  value={(Math.min(built, FLOORS) / FLOORS) * 100}
                  className="h-1.5 w-40"
                  indicatorClassName={phase === 'complete' ? 'bg-status-success' : undefined}
                />
                <span className="font-mono text-[11.5px] tabular-nums text-graphite-500">
                  {String(Math.min(built, FLOORS)).padStart(2, '0')} / {FLOORS} pav
                </span>
              </div>
              <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-graphite-400">
                {currentWork.code} · BL-A · {currentWork.coordinates}
              </span>
            </div>
          </Card>

          {/* pavimentos */}
          <div className="flex min-w-0 flex-col gap-5">
            <Card>
              <CardHeader>
                <CardTitle>Pavimentos</CardTitle>
                <Badge variant={withNC > 0 ? 'critical' : 'success'}>
                  {withNC > 0 ? `${withNC} com NC` : 'sem NC aberta'}
                </Badge>
              </CardHeader>
              <div className="max-h-[430px] overflow-y-auto">
                {[...floors].reverse().map((f) => {
                  const hot = f.ncCount > 0
                  const warn = f.alertCount > 0 && !hot
                  return (
                    <button
                      key={f.code}
                      onMouseEnter={() => setHovered(f.code)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(f.code)}
                      onBlur={() => setHovered(null)}
                      className={cn(
                        'flex w-full items-center gap-3 border-b border-border px-4 py-2.5 text-left transition-colors last:border-0',
                        hovered === f.code ? 'bg-technical-100/70' : 'hover:bg-graphite-50',
                      )}
                    >
                      <span
                        className={cn(
                          'h-6 w-1 shrink-0 rounded-[1px]',
                          hot ? 'bg-status-critical' : warn ? 'bg-status-warning' : 'bg-technical-300',
                        )}
                      />
                      <span className="font-mono text-[12.5px] font-500 text-graphite-900">{f.code}</span>
                      <span className="ml-auto flex items-center gap-3 font-mono text-[11px] tabular-nums">
                        {f.alertCount > 0 && <span className="text-status-warning">{f.alertCount} alerta</span>}
                        {hot && (
                          <span className="flex items-center gap-1 text-status-critical">
                            <TriangleAlert className="h-3 w-3" />
                            {f.ncCount} NC
                          </span>
                        )}
                        {!hot && f.alertCount === 0 && <span className="text-graphite-300">conforme</span>}
                      </span>
                    </button>
                  )
                })}
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cobertura de câmeras</CardTitle>
                <Camera className="h-4 w-4 text-graphite-300" />
              </CardHeader>
              <CardContent className="space-y-2">
                {blockCameras.slice(0, 5).map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[12px] text-graphite-700">{c.code}</span>
                    <span className="truncate text-[12.5px] text-graphite-500">{c.locationCode}</span>
                    <span className="shrink-0 font-mono text-[11px] tabular-nums text-graphite-400">
                      {String(c.alertsToday).padStart(2, '0')} alertas
                    </span>
                  </div>
                ))}
                <p className="border-t border-border pt-2.5 text-[12.5px] leading-snug text-graphite-500">
                  O modelo usa a mesma base de dados da operação: os pavimentos em vermelho são os que têm não conformidade
                  aberta agora.
                </p>
              </CardContent>
            </Card>

            <div className="rounded-md border border-navy-800/15 bg-navy-800/[0.04] px-4 py-3.5">
              <p className="flex items-center gap-2 font-display text-[13px] font-600 uppercase tracking-[0.12em] text-navy-900">
                <Boxes className="h-4 w-4" />
                Para onde isso evolui
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-graphite-600">
                O mesmo volume aceita o IFC do projeto executivo: cada detecção da IA passa a marcar o elemento construtivo
                exato — pilar, laje, vedação — em vez do pavimento inteiro.
              </p>
            </div>
          </div>
        </div>
      </PageBody>
    </>
  )
}
