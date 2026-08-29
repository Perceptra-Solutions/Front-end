import * as React from 'react'
import { Link } from 'react-router-dom'
import { Boxes, MousePointer2 } from 'lucide-react'

import { PageBody, PageHeader } from '@/components/shared/PageHeader'
import { Carregando, SemDadoNoBackend } from '@/components/shared/EstadoPagina'
import { HologramBuilding, type FloorInfo, type TwinPhase } from '@/components/twin/HologramBuilding'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/AppStore'
import { cn } from '@/lib/utils'

/**
 * Gêmeo digital.
 *
 * A versão anterior erguia um prédio de **12 pavimentos fixos** e cruzava as
 * NCs contra códigos `PV-01`…`PV-12` que vinham do mock — com dado real
 * aquilo nunca casava, e o modelo mostrava um edifício que não existe.
 *
 * Agora a estrutura vem dos **locais cadastrados na obra** (`GET /locais`):
 * cada `local` com tipo `PAVIMENTO` é um pavimento do modelo, na ordem do
 * cadastro. Sem pavimento cadastrado não há o que erguer, e a tela diz isso
 * em vez de inventar um.
 */
export default function DigitalTwin() {
  const { alerts, nonConformities, obraAtual, locais, loading } = useAppStore()
  const [hovered, setHovered] = React.useState<string | null>(null)
  const [phase, setPhase] = React.useState<TwinPhase>('plan')
  const [built, setBuilt] = React.useState(0)

  const pavimentos: FloorInfo[] = React.useMemo(() => {
    if (!obraAtual) return []

    const daObra = locais.filter((l) => l.obraId === obraAtual.id && l.tipo === 'PAVIMENTO')

    return daObra
      .slice()
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { numeric: true }))
      .map((local, i) => ({
        code: local.codigo ?? local.nome,
        index: i + 1,
        // NCs e alertas contados pelo NOME do local, que é o que o adapter
        // usa como `locationLabel` — o mesmo texto dos dois lados.
        ncCount: nonConformities.filter((n) => n.locationLabel === local.nome && n.status !== 'resolved').length,
        alertCount: alerts.filter((a) => a.locationLabel === local.nome && a.status === 'pending').length,
      }))
  }, [locais, obraAtual, nonConformities, alerts])

  const aoMudarFase = React.useCallback((p: TwinPhase, b: number) => {
    setPhase(p)
    setBuilt(b)
  }, [])

  const comNc = pavimentos.filter((p) => p.ncCount > 0).length

  if (loading) {
    return (
      <>
        <PageHeader eyebrow="Gêmeo digital" title="Modelo volumétrico" />
        <PageBody>
          <Carregando texto="Carregando estrutura da obra…" />
        </PageBody>
      </>
    )
  }

  if (pavimentos.length === 0) {
    return (
      <>
        <PageHeader
          eyebrow="Gêmeo digital"
          title="Modelo volumétrico"
          description="O modelo 3D é construído a partir dos pavimentos cadastrados na obra."
          meta={obraAtual ? [{ label: 'Obra', value: obraAtual.codigo }] : undefined}
        />
        <PageBody className="space-y-4">
          <div className="rounded-md border border-dashed border-graphite-200 bg-card px-6 py-16 text-center shadow-panel">
            <Boxes className="mx-auto h-6 w-6 text-graphite-300" />
            <p className="mt-3 text-[14px] font-600 text-graphite-800">Nenhum pavimento cadastrado</p>
            <p className="mx-auto mt-1 max-w-md text-[13px] text-graphite-500">
              O gêmeo digital precisa de locais do tipo <b>PAVIMENTO</b> nesta obra para saber quantos andares erguer.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-5">
              <Link to="/works">Ver cadastro da obra</Link>
            </Button>
          </div>
          <SemDadoNoBackend>
            Antes desta tela mostrava um edifício de 12 pavimentos fixos, com área e cotas que não existiam no banco. O
            modelo agora só é erguido com estrutura real: <code className="font-mono text-[11.5px]">local</code> de tipo{' '}
            <b>PAVIMENTO</b>. Geometria fina (largura, profundidade, pé-direito) continua sem contrapartida no schema — é
            representação, não medição.
          </SemDadoNoBackend>
        </PageBody>
      </>
    )
  }

  return (
    <>
      <PageHeader
        eyebrow="Gêmeo digital"
        title="Modelo volumétrico"
        description="A estrutura sobe da fundação à cobertura e marca, pavimento a pavimento, onde há ocorrência aberta."
        meta={[
          { label: 'Obra', value: obraAtual?.codigo ?? '—' },
          { label: 'Pavimentos', value: String(pavimentos.length) },
        ]}
      />

      <PageBody className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
          <Card className="min-w-0 overflow-hidden">
            <CardHeader>
              <CardTitle>Maquete</CardTitle>
              <span className="flex items-center gap-1.5 text-[11px] text-graphite-400">
                <MousePointer2 className="h-3.5 w-3.5" />
                arraste para girar · scroll aproxima
              </span>
            </CardHeader>
            <HologramBuilding
              floors={pavimentos}
              highlighted={hovered}
              onPhaseChange={aoMudarFase}
              className="h-[420px] w-full lg:h-[560px]"
            />
          </Card>

          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Pavimentos</CardTitle>
              <span className="text-[11px] text-graphite-400">
                {comNc > 0 ? `${comNc} com NC aberta` : 'sem NC aberta'}
              </span>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="max-h-[420px] divide-y divide-border overflow-y-auto">
                {[...pavimentos].reverse().map((p) => {
                  const critico = p.ncCount > 0
                  const atencao = p.alertCount > 0 && !critico
                  return (
                    <li
                      key={p.code}
                      onMouseEnter={() => setHovered(p.code)}
                      onMouseLeave={() => setHovered(null)}
                      className={cn(
                        'flex cursor-default items-center gap-3 px-4 py-2 transition-colors',
                        hovered === p.code && 'bg-graphite-50',
                      )}
                    >
                      <span
                        className={cn(
                          'h-1.5 w-1.5 shrink-0 rounded-full',
                          critico ? 'bg-status-critical' : atencao ? 'bg-status-warning' : 'bg-graphite-200',
                        )}
                      />
                      <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-graphite-700">{p.code}</span>
                      {critico && (
                        <span className="font-mono text-[11px] tabular-nums text-status-critical">
                          {p.ncCount} NC
                        </span>
                      )}
                      {atencao && (
                        <span className="font-mono text-[11px] tabular-nums text-status-warning">
                          {p.alertCount} alerta
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </CardContent>
          </Card>
        </div>

        <SemDadoNoBackend>
          Os pavimentos e as ocorrências vêm do backend. A <b>geometria</b> (largura, profundidade, pé-direito, fachada)
          é representação — o schema não guarda dimensões da edificação. Fase da animação:{' '}
          <span className="font-mono">{phase}</span> · {built.toFixed(0)} pavimento(s) erguido(s).
        </SemDadoNoBackend>
      </PageBody>
    </>
  )
}
