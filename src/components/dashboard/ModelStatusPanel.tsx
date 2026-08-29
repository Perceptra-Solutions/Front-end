import * as React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/store/AppStore'
import { pct } from '@/lib/utils'

/**
 * Modelos de visão computacional em operação.
 *
 * Tudo aqui é derivado de dado real: o catálogo vem de `/modelos-ia`, a
 * contagem de câmeras e as detecções vêm do que já está no store. A versão
 * anterior lia `src/data/aiModels.ts`, que trazia F1, latência de inferência
 * e "detecções hoje" fixos — números que pareciam telemetria e não vinham
 * de lugar nenhum.
 */
export function ModelStatusPanel() {
  const { modelos, cameras, alerts, loading } = useAppStore()

  const linhas = React.useMemo(() => {
    return modelos
      .map((m) => {
        const doModelo = alerts.filter((a) => a.modelName === m.nome && a.modelVersion === m.versao)
        const triadas = doModelo.filter((a) => a.status !== 'pending')
        const confirmadas = doModelo.filter((a) => a.status === 'confirmed')

        return {
          modelo: m,
          cameras: cameras.filter((c) => c.modeloIaId === m.id).length,
          deteccoes: doModelo.length,
          // Fração das já triadas que o engenheiro confirmou — o inverso da
          // taxa de falso positivo. `null` enquanto ninguém triou nada:
          // 0% ali seria lido como "modelo péssimo".
          taxaConfirmacao: triadas.length > 0 ? confirmadas.length / triadas.length : null,
        }
      })
      .sort((a, b) => b.deteccoes - a.deteccoes)
  }, [modelos, cameras, alerts])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Modelos de IA em operação</CardTitle>
        <Link
          to="/ai-models"
          className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-technical-600 hover:underline"
        >
          Detalhes
        </Link>
      </CardHeader>
      <CardContent className="space-y-3.5">
        {loading && <p className="text-[13px] text-graphite-400">Carregando…</p>}
        {!loading && linhas.length === 0 && (
          <p className="text-[13px] text-graphite-400">Nenhum modelo publicado.</p>
        )}

        {linhas.map(({ modelo, cameras: qtdCameras, deteccoes, taxaConfirmacao }) => (
          <div key={modelo.id} className="border-b border-border pb-3.5 last:border-0 last:pb-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-display text-[13px] font-600 uppercase tracking-[0.03em] text-navy-900">
                  {modelo.nome} <span className="text-graphite-400">v{modelo.versao}</span>
                </p>
                <p className="truncate font-mono text-[10px] uppercase tracking-[0.1em] text-graphite-400">
                  {modelo.tipoDeteccao} · {qtdCameras} câmeras · limiar {pct(Number(modelo.limiarConfianca) * 100)}
                </p>
              </div>
              <Badge variant={modelo.ativo ? 'success' : 'default'}>{modelo.ativo ? 'Ativo' : 'Aposentado'}</Badge>
            </div>

            {taxaConfirmacao !== null && (
              <div className="mt-2.5 flex items-center gap-3">
                <Progress
                  value={taxaConfirmacao * 100}
                  className="h-1"
                  indicatorClassName={taxaConfirmacao >= 0.75 ? 'bg-status-success' : 'bg-status-warning'}
                />
                <span className="shrink-0 font-mono text-[11px] tabular-nums text-graphite-500">
                  {pct(taxaConfirmacao * 100)} confirmadas
                </span>
              </div>
            )}

            <div className="mt-2 flex gap-4 font-mono text-[10.5px] text-graphite-400">
              <span>
                DETECÇÕES <span className="text-graphite-700">{deteccoes}</span>
              </span>
              <span>
                TRIAGEM{' '}
                <span className="text-graphite-700">
                  {taxaConfirmacao === null ? 'pendente' : pct(taxaConfirmacao * 100)}
                </span>
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
