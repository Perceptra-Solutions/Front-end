import { Camera, Cpu, Fingerprint } from 'lucide-react'
import { PageBody, PageHeader } from '@/components/shared/PageHeader'
import { Carregando, ErroConexao, SemDadoNoBackend, Vazio } from '@/components/shared/EstadoPagina'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useRecurso } from '@/hooks/useRecurso'
import { listarCameras, listarModelosIa } from '@/lib/api/cadastros'
import { buscarResumoPainel } from '@/lib/api/painel'
import { formatDate, pct } from '@/lib/utils'
import { cn } from '@/lib/utils'

/** Só números viram barra de métrica; o resto do jsonb é exibido como texto. */
function metricasNumericas(metricas: Record<string, unknown> | null): { chave: string; valor: number }[] {
  if (!metricas) return []
  return Object.entries(metricas)
    .filter((par): par is [string, number] => typeof par[1] === 'number')
    .map(([chave, valor]) => ({ chave, valor: valor <= 1 ? valor * 100 : valor }))
}

export default function AIModels() {
  const { dados, carregando, erro, recarregar } = useRecurso(async (signal) => {
    const [modelos, cameras, resumo] = await Promise.all([
      listarModelosIa(signal),
      listarCameras({}, signal),
      buscarResumoPainel(undefined, signal),
    ])

    // A taxa de falso positivo é o único indicador de qualidade REAL aqui:
    // vem de `/painel/resumo`, calculada por versão de modelo sobre as
    // detecções já triadas (PENDENTE fica fora do denominador).
    const desempenhoPorModelo = new Map(resumo.falsoPositivoPorModelo.map((f) => [f.modeloId, f]))
    const camerasPorModelo = new Map<string, number>()
    for (const c of cameras.itens) {
      if (!c.modeloIaId) continue
      camerasPorModelo.set(c.modeloIaId, (camerasPorModelo.get(c.modeloIaId) ?? 0) + 1)
    }

    return modelos.itens
      .map((modelo) => ({
        modelo,
        desempenho: desempenhoPorModelo.get(modelo.id),
        cameras: camerasPorModelo.get(modelo.id) ?? 0,
      }))
      .sort((a, b) =>
        a.modelo.nome === b.modelo.nome
          ? b.modelo.versao.localeCompare(a.modelo.versao)
          : a.modelo.nome.localeCompare(b.modelo.nome),
      )
  })

  const linhas = dados ?? []
  const ativos = linhas.filter((l) => l.modelo.ativo).length

  return (
    <>
      <PageHeader
        eyebrow="Inteligência artificial · Inferência"
        title="Modelos de IA"
        description="Versões publicadas do catálogo. Cada versão é imutável: reajustar limiar ou aposentar é permitido, reescrever não."
        meta={[
          { label: 'Versões', value: carregando ? '—' : String(linhas.length) },
          { label: 'Ativas', value: carregando ? '—' : String(ativos) },
        ]}
      />

      <PageBody className="space-y-5">
        {carregando && <Carregando texto="Carregando catálogo de modelos…" />}
        {erro && !carregando && <ErroConexao mensagem={erro} aoTentarNovamente={recarregar} />}
        {!carregando && !erro && linhas.length === 0 && (
          <Vazio titulo="Nenhum modelo publicado" descricao="Publique a primeira versão de modelo para o catálogo aparecer aqui." />
        )}

        {!carregando && !erro && linhas.length > 0 && (
          <>
            <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
              {linhas.map(({ modelo, desempenho, cameras }) => {
                const metricas = metricasNumericas(modelo.metricas)
                return (
                  <Card key={modelo.id}>
                    <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3.5">
                      <div className="min-w-0">
                        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-graphite-400">
                          {modelo.tipoDeteccao}
                        </p>
                        <h3 className="mt-0.5 truncate font-display text-[17.5px] font-600 uppercase tracking-[0.01em] text-navy-900">
                          {modelo.nome}
                        </h3>
                        <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[12px] text-graphite-500">
                          <Cpu className="h-3 w-3" />v{modelo.versao} · publicado em {formatDate(modelo.publicadoEm)}
                        </p>
                      </div>
                      <Badge variant={modelo.ativo ? 'success' : 'default'} className="shrink-0">
                        {modelo.ativo ? 'Ativo' : 'Aposentado'}
                      </Badge>
                    </div>

                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <p className="tech-label">Limiar</p>
                          <p className="mt-0.5 font-mono text-[15px] font-600 tabular-nums text-graphite-900">
                            {pct(Number(modelo.limiarConfianca) * 100)}
                          </p>
                          <p className="text-[11px] text-graphite-400">confiança mínima</p>
                        </div>
                        <div>
                          <p className="tech-label">Falso positivo</p>
                          <p
                            className={cn(
                              'mt-0.5 font-mono text-[15px] font-600 tabular-nums',
                              !desempenho
                                ? 'text-graphite-400'
                                : desempenho.taxa > 0.25
                                  ? 'text-status-critical'
                                  : 'text-status-success',
                            )}
                          >
                            {desempenho ? pct(desempenho.taxa * 100) : '—'}
                          </p>
                          <p className="text-[11px] text-graphite-400">
                            {desempenho ? `${desempenho.falsosPositivos}/${desempenho.totalTriado} triadas` : 'sem triagem'}
                          </p>
                        </div>
                        <div>
                          <p className="flex items-center gap-1 tech-label">
                            <Camera className="h-3 w-3" />
                            Câmeras
                          </p>
                          <p className="mt-0.5 font-mono text-[15px] font-600 tabular-nums text-graphite-900">
                            {String(cameras).padStart(2, '0')}
                          </p>
                          <p className="text-[11px] text-graphite-400">usando esta versão</p>
                        </div>
                      </div>

                      {desempenho && desempenho.totalTriado > 0 && (
                        <div className="border-t border-border pt-3">
                          <div className="flex items-baseline justify-between">
                            <span className="tech-label">Acerto na triagem</span>
                            <span className="font-mono text-[13px] font-600 tabular-nums text-navy-900">
                              {pct((1 - desempenho.taxa) * 100)}
                            </span>
                          </div>
                          <Progress value={(1 - desempenho.taxa) * 100} className="mt-1.5 h-1.5" />
                          <p className="mt-1 text-[11.5px] text-graphite-400">
                            Fração das detecções triadas que o engenheiro confirmou.
                          </p>
                        </div>
                      )}

                      {metricas.length > 0 && (
                        <div className="space-y-2 border-t border-border pt-3">
                          <p className="tech-label">Métricas do treino</p>
                          {metricas.map((m) => (
                            <div key={m.chave}>
                              <div className="flex items-baseline justify-between">
                                <span className="text-[12.5px] text-graphite-600">{m.chave}</span>
                                <span className="font-mono text-[12.5px] tabular-nums text-graphite-900">
                                  {m.valor.toFixed(1)}%
                                </span>
                              </div>
                              <Progress value={m.valor} className="mt-1 h-1" />
                            </div>
                          ))}
                        </div>
                      )}

                      {modelo.hashArtefato && (
                        <p
                          className="flex items-center gap-1.5 border-t border-border pt-3 font-mono text-[10.5px] text-graphite-400"
                          title={modelo.hashArtefato}
                        >
                          <Fingerprint className="h-3 w-3 shrink-0" />
                          {modelo.hashArtefato.slice(0, 32)}…
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <SemDadoNoBackend>
              A <b>taxa de falso positivo</b> acima é real: vem de{' '}
              <code className="font-mono text-[11.5px]">/painel/resumo</code>, por versão de modelo, sobre as detecções já
              triadas. Já <b>precision/recall/F1</b> só aparecem se tiverem sido gravados no campo{' '}
              <code className="font-mono text-[11.5px]">metricas</code> na publicação — o backend não os recalcula. Saíram
              da tela: latência de inferência, GPU e histórico de retreino, que não existem no schema.
            </SemDadoNoBackend>
          </>
        )}
      </PageBody>
    </>
  )
}
