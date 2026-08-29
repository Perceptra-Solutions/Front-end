import { Link } from 'react-router-dom'
import { CalendarDays, Camera, HardHat, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/AppStore'
import type { StatusObra } from '@/lib/api/types'
import { formatDate } from '@/lib/utils'

const STATUS: Record<StatusObra, { rotulo: string; variant: 'info' | 'warning' | 'success' | 'default' }> = {
  PLANEJAMENTO: { rotulo: 'Planejamento', variant: 'default' },
  EM_ANDAMENTO: { rotulo: 'Em andamento', variant: 'info' },
  PARALISADA: { rotulo: 'Paralisada', variant: 'warning' },
  CONCLUIDA: { rotulo: 'Concluída', variant: 'success' },
}

/**
 * Cadastro da obra em contexto.
 *
 * A versão anterior mostrava avanço físico (barra de 0–100%), blocos,
 * pavimentos, área construída e coordenadas — nenhum desses campos existe na
 * tabela `obra`. Eram valores fixos de `src/data/works.ts` que pareciam
 * medição. Aqui só entra o que o backend guarda de verdade.
 */
export function WorkProgressPanel() {
  const { obraAtual, cameras, loading } = useAppStore()

  if (loading || !obraAtual) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Situação da obra</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[13px] text-graphite-400">{loading ? 'Carregando…' : 'Nenhuma obra cadastrada.'}</p>
        </CardContent>
      </Card>
    )
  }

  const st = STATUS[obraAtual.status]
  const camerasDaObra = cameras.filter((c) => c.obraId === obraAtual.id)
  const ativas = camerasDaObra.filter((c) => c.status === 'ATIVA').length

  const diasParaEntrega = obraAtual.fimPrevisto
    ? Math.round((new Date(obraAtual.fimPrevisto).getTime() - Date.now()) / 86_400_000)
    : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Situação da obra</CardTitle>
        <span className="font-mono text-[10.5px] text-graphite-300">{obraAtual.codigo}</span>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-display text-[15px] font-600 text-navy-900">{obraAtual.nome}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-graphite-500">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {[obraAtual.cidade, obraAtual.uf].filter(Boolean).join(' · ') || 'Localização não informada'}
              </span>
            </p>
          </div>
          <Badge variant={st.variant} className="shrink-0">
            {st.rotulo}
          </Badge>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-4">
          <div className="flex items-start gap-2">
            <Camera className="mt-0.5 h-3.5 w-3.5 text-graphite-300" />
            <div>
              <dt className="tech-label">Câmeras</dt>
              <dd className="text-[13px] tabular-nums text-graphite-700">
                {ativas}/{camerasDaObra.length} ativas
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CalendarDays className="mt-0.5 h-3.5 w-3.5 text-graphite-300" />
            <div>
              <dt className="tech-label">Início previsto</dt>
              <dd className="text-[13px] tabular-nums text-graphite-700">
                {obraAtual.inicioPrevisto ? formatDate(obraAtual.inicioPrevisto) : '—'}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CalendarDays className="mt-0.5 h-3.5 w-3.5 text-graphite-300" />
            <div>
              <dt className="tech-label">Fim previsto</dt>
              <dd className="text-[13px] tabular-nums text-graphite-700">
                {obraAtual.fimPrevisto ? formatDate(obraAtual.fimPrevisto) : '—'}
                {diasParaEntrega !== null && (
                  <span className="text-graphite-400"> · {diasParaEntrega} d</span>
                )}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <HardHat className="mt-0.5 h-3.5 w-3.5 text-graphite-300" />
            <div>
              <dt className="tech-label">Endereço</dt>
              <dd className="truncate text-[13px] text-graphite-700" title={obraAtual.endereco ?? undefined}>
                {obraAtual.endereco ?? '—'}
              </dd>
            </div>
          </div>
        </dl>

        <div className="flex items-center justify-end border-t border-border pt-3">
          <Button asChild variant="ghost" size="xs">
            <Link to="/works">Ver cadastro</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
