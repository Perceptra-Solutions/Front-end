import { PageBody, PageHeader } from '@/components/shared/PageHeader'
import { Carregando, ErroConexao, SemDadoNoBackend, Vazio } from '@/components/shared/EstadoPagina'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRecurso } from '@/hooks/useRecurso'
import { listarRequisitosNorma, type RequisitoNormaApi } from '@/lib/api/cadastros'
import { listarNaoConformidades } from '@/lib/api/naoConformidades'
import { cn } from '@/lib/utils'

/** As sete categorias de `categoria_desempenho` no backend. */
const CATEGORIA: Record<string, string> = {
  TERMICO: 'Desempenho térmico',
  ACUSTICO: 'Desempenho acústico',
  ESTANQUEIDADE: 'Estanqueidade',
  ESTRUTURAL: 'Estrutural',
  SEGURANCA_FOGO: 'Segurança contra incêndio',
  DURABILIDADE: 'Durabilidade',
  OUTRO: 'Outro',
}

const STATUS_ABERTOS = ['ABERTA', 'EM_CORRECAO', 'AGUARDANDO_VERIFICACAO']

interface ItemNorma {
  requisito: RequisitoNormaApi
  ocorrencias: number
  emAberto: number
}

export default function Standards() {
  const { dados, carregando, erro, recarregar } = useRecurso(async (signal) => {
    const [requisitos, ncs] = await Promise.all([
      listarRequisitosNorma(signal),
      listarNaoConformidades({ tamanho: 100 }, signal),
    ])

    const porRequisito = new Map<string, { total: number; abertas: number }>()
    for (const nc of ncs.itens) {
      if (!nc.requisitoNormaId) continue
      const atual = porRequisito.get(nc.requisitoNormaId) ?? { total: 0, abertas: 0 }
      atual.total += 1
      if (STATUS_ABERTOS.includes(nc.status)) atual.abertas += 1
      porRequisito.set(nc.requisitoNormaId, atual)
    }

    // O backend guarda `requisito_norma` achatado (uma linha por item). A
    // norma é a chave natural de agrupamento — é assim que um engenheiro lê:
    // "NBR 15575" com seus itens, não 16 linhas soltas.
    const porNorma = new Map<string, ItemNorma[]>()
    for (const r of requisitos.itens) {
      const contagem = porRequisito.get(r.id) ?? { total: 0, abertas: 0 }
      const lista = porNorma.get(r.norma) ?? []
      lista.push({ requisito: r, ocorrencias: contagem.total, emAberto: contagem.abertas })
      porNorma.set(r.norma, lista)
    }

    return [...porNorma.entries()]
      .map(([norma, itens]) => ({
        norma,
        itens: itens.sort((a, b) => a.requisito.item.localeCompare(b.requisito.item)),
        ocorrencias: itens.reduce((s, i) => s + i.ocorrencias, 0),
        emAberto: itens.reduce((s, i) => s + i.emAberto, 0),
      }))
      .sort((a, b) => a.norma.localeCompare(b.norma))
  })

  const normas = dados ?? []
  const totalItens = normas.reduce((s, n) => s + n.itens.length, 0)

  return (
    <>
      <PageHeader
        eyebrow="Conformidade · Base normativa"
        title="Requisitos e normas"
        description="As normas que a plataforma usa para classificar cada ocorrência. Toda NC nasce citando um item específico."
        meta={[
          { label: 'Normas', value: carregando ? '—' : String(normas.length) },
          { label: 'Itens mapeados', value: carregando ? '—' : String(totalItens) },
        ]}
      />

      <PageBody className="space-y-4">
        {carregando && <Carregando texto="Carregando base normativa…" />}
        {erro && !carregando && <ErroConexao mensagem={erro} aoTentarNovamente={recarregar} />}
        {!carregando && !erro && normas.length === 0 && (
          <Vazio titulo="Nenhum requisito cadastrado" descricao="Cadastre os requisitos de norma usados para classificar as não conformidades." />
        )}

        {!carregando &&
          !erro &&
          normas.map((n) => (
            <Card key={n.norma} className="overflow-hidden">
              <div className="flex">
                <span className={cn('w-1 shrink-0', n.emAberto > 0 ? 'bg-status-critical' : 'bg-status-success')} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-4 py-3.5">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-[18px] font-700 uppercase tracking-[0.02em] text-navy-900">
                          {n.norma}
                        </span>
                        <Badge variant={n.emAberto > 0 ? 'critical' : 'success'}>
                          {n.emAberto > 0 ? 'Com NC em aberto' : 'Sem NC em aberto'}
                        </Badge>
                      </div>
                      <p className="mt-1 text-[13.5px] text-graphite-600">
                        {n.itens.length} {n.itens.length === 1 ? 'item mapeado' : 'itens mapeados'} nesta norma.
                      </p>
                    </div>

                    <div className="flex gap-6">
                      <div>
                        <p className="tech-label">Ocorrências</p>
                        <p className="font-mono text-[18px] font-600 tabular-nums text-graphite-900">{n.ocorrencias}</p>
                      </div>
                      <div>
                        <p className="tech-label">Em aberto</p>
                        <p
                          className={cn(
                            'font-mono text-[18px] font-600 tabular-nums',
                            n.emAberto > 0 ? 'text-status-critical' : 'text-status-success',
                          )}
                        >
                          {String(n.emAberto).padStart(2, '0')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <CardContent>
                    <ul className="divide-y divide-border rounded-[3px] border border-border">
                      {n.itens.map(({ requisito, ocorrencias, emAberto }) => (
                        <li key={requisito.id} className="flex flex-wrap items-start gap-3 px-3 py-2.5">
                          <span className="shrink-0 font-mono text-[11.5px] font-600 text-technical-700">
                            {requisito.item}
                          </span>
                          <span className="min-w-0 flex-1 text-[13px] text-graphite-600">{requisito.descricao}</span>
                          <Badge variant="outline" className="shrink-0">
                            {CATEGORIA[requisito.categoria] ?? requisito.categoria}
                          </Badge>
                          <span
                            className="shrink-0 font-mono text-[11.5px] tabular-nums text-graphite-500"
                            title="NCs vinculadas a este item (total · em aberto)"
                          >
                            {ocorrencias} · <span className={emAberto > 0 ? 'text-status-critical' : ''}>{emAberto}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}

        {!carregando && !erro && normas.length > 0 && (
          <SemDadoNoBackend>
            Saíram desta tela por não existirem no backend: <b>última verificação</b> e <b>responsável pela norma</b>. A
            tabela <code className="font-mono text-[11.5px]">requisito_norma</code> guarda norma, item, categoria e
            descrição; a contagem de ocorrências acima é derivada das NCs que citam cada item.
          </SemDadoNoBackend>
        )}
      </PageBody>
    </>
  )
}
