import * as React from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PageBody, PageHeader, SectionTitle } from '@/components/shared/PageHeader'
import { ChartFrame, ChartTooltip } from '@/components/reports/ChartFrame'
import { EmitirRelatorioDialog } from '@/components/reports/EmitirRelatorioDialog'
import { RelatoriosEmitidos } from '@/components/reports/RelatoriosEmitidos'
import { listarObras } from '@/lib/api/cadastros'
import { garantirUsuario } from '@/lib/api/client'
import { buscarResumoPainel } from '@/lib/api/painel'
import { listarRelatorios } from '@/lib/api/relatorios'
import type { ObraApi, RelatorioApi, ResumoPainelApi } from '@/lib/api/types'
import { useAppStore } from '@/store/AppStore'
import { chartAxis, chartCategorical, chartMargin, chartStatus } from '@/lib/chartTheme'
import { pct } from '@/lib/utils'

const horas = (valor: number | null) => (valor === null ? '—' : `${valor.toFixed(1)} h`)

const COR_SEVERIDADE: Record<string, string> = {
  CRITICA: chartStatus.critical,
  ALTA: chartStatus.warning,
  MEDIA: chartCategorical[0],
  BAIXA: chartCategorical[2],
}

const ORDEM_SEVERIDADE = ['CRITICA', 'ALTA', 'MEDIA', 'BAIXA']

/** Indicadores vindos de `GET /painel/resumo` — números reais do backend. */
function indicadoresReais(resumo: ResumoPainelApi | null) {
  if (!resumo) return null

  const abertas = resumo.ncsAbertasPorSeveridade.reduce((s, i) => s + i.total, 0)
  const criticas = resumo.ncsAbertasPorSeveridade.find((i) => i.severidade === 'CRITICA')?.total ?? 0
  const piorModelo = [...resumo.falsoPositivoPorModelo].sort((a, b) => b.taxa - a.taxa)[0]

  return [
    { label: 'NCs em aberto', value: String(abertas), hint: `${criticas} crítica(s)` },
    {
      label: 'Com prazo vencido',
      value: String(resumo.ncsComPrazoVencido),
      hint: 'não terminais, prazo < agora',
    },
    {
      label: 'Tempo médio de fechamento',
      value: horas(resumo.tempoMedioFechamentoHoras),
      hint: 'só NCs resolvidas',
    },
    {
      label: 'Taxa de reincidência',
      value: pct(resumo.taxaReincidencia * 100),
      hint: 'exclui canceladas do total',
    },
    {
      label: 'Pior taxa de falso positivo',
      value: piorModelo ? pct(piorModelo.taxa * 100) : '—',
      hint: piorModelo ? `${piorModelo.modeloNome} ${piorModelo.modeloVersao}` : 'sem detecção triada',
    },
    {
      label: 'Frota de câmeras',
      value: `${resumo.saudeDaFrota.ativas}/${resumo.saudeDaFrota.total}`,
      hint: `${resumo.saudeDaFrota.offline} offline · ${resumo.saudeDaFrota.manutencao} em manutenção`,
    },
  ]
}

export default function Reports() {
  const [obras, setObras] = React.useState<ObraApi[]>([])
  const [relatorios, setRelatorios] = React.useState<RelatorioApi[]>([])
  const [resumo, setResumo] = React.useState<ResumoPainelApi | null>(null)
  const [carregando, setCarregando] = React.useState(true)
  const [papel, setPapel] = React.useState<'GESTOR' | 'ENGENHEIRO' | null>(null)
  const { alerts } = useAppStore()

  React.useEffect(() => {
    const controle = new AbortController()

    Promise.all([
      listarObras(controle.signal),
      listarRelatorios({ tamanho: 20 }, controle.signal),
      buscarResumoPainel(undefined, controle.signal),
      // Busca /auth/eu quando o token veio do cache — sem isto o papel viria
      // null num reload e o botão de emitir ficaria travado para o gestor.
      garantirUsuario(),
    ])
      .then(([obrasApi, relatoriosApi, resumoApi, usuario]) => {
        if (controle.signal.aborted) return
        setObras(obrasApi.itens)
        setRelatorios(relatoriosApi.itens)
        setResumo(resumoApi)
        setPapel(usuario?.papel ?? null)
      })
      .catch(() => {
        /* backend fora do ar: os blocos ficam vazios em vez de quebrar a tela */
      })
      .finally(() => {
        if (!controle.signal.aborted) setCarregando(false)
      })

    return () => controle.abort()
  }, [])

  const nomeObra = React.useCallback(
    (obraId: string) => obras.find((o) => o.id === obraId)?.codigo ?? '—',
    [obras],
  )

  const indicadores = indicadoresReais(resumo)

  // ---------------------------------------------------------------- gráficos
  // Tudo abaixo sai de `/painel/resumo` ou das detecções já carregadas no
  // store. As três séries temporais que existiam aqui (conformidade mês a
  // mês, MTTR mensal, falso positivo por semana) foram REMOVIDAS: o backend
  // agrega o estado atual e não guarda histórico, então elas só podiam ser
  // inventadas.
  const porSeveridade = React.useMemo(
    () =>
      [...(resumo?.ncsAbertasPorSeveridade ?? [])].sort(
        (a, b) => ORDEM_SEVERIDADE.indexOf(a.severidade) - ORDEM_SEVERIDADE.indexOf(b.severidade),
      ),
    [resumo],
  )

  const porCategoria = React.useMemo(
    () => [...(resumo?.ncsAbertasPorCategoria ?? [])].sort((a, b) => b.total - a.total),
    [resumo],
  )

  const porModelo = React.useMemo(
    () =>
      (resumo?.falsoPositivoPorModelo ?? [])
        .filter((m) => m.totalTriado > 0)
        .map((m) => ({ modelo: `${m.modeloNome} v${m.modeloVersao}`, taxa: Number((m.taxa * 100).toFixed(1)) }))
        .sort((a, b) => b.taxa - a.taxa),
    [resumo],
  )

  const porCamera = React.useMemo(() => {
    const acumulado = new Map<string, { detectadas: number; confirmadas: number }>()
    for (const a of alerts) {
      const atual = acumulado.get(a.cameraCode) ?? { detectadas: 0, confirmadas: 0 }
      atual.detectadas += 1
      if (a.status === 'confirmed') atual.confirmadas += 1
      acumulado.set(a.cameraCode, atual)
    }
    return [...acumulado.entries()]
      .map(([camera, v]) => ({ camera, ...v }))
      .sort((a, b) => b.detectadas - a.detectadas)
      .slice(0, 10)
  }, [alerts])

  return (
    <>
      <PageHeader
        eyebrow="Análise · Indicadores e emissão"
        title="Relatórios e indicadores"
        description="Leitura consolidada da operação: conformidade, resposta às ocorrências e desempenho dos modelos de visão computacional."
        meta={[
          { label: 'Obras', value: String(obras.length) },
          { label: 'Emitidos', value: String(relatorios.length) },
        ]}
        actions={
          <EmitirRelatorioDialog
            obras={obras}
            obraPadrao={obras[0]?.id}
            // POST /relatorios exige GESTOR: quem emite o documento que vai
            // para a auditoria assina por ele. O usuário fixo desta versão é
            // engenheiro (ver src/lib/api/client.ts), então o botão fica
            // desabilitado com o motivo — em vez de deixar clicar e tomar 403.
            habilitado={papel === 'GESTOR'}
            motivoDesabilitado={
              papel === null
                ? 'Aguardando conexão com o backend.'
                : 'Só o GESTOR emite relatório. Troque VITE_DEMO_EMAIL para gestora@perceptra.dev.'
            }
            aoEmitir={(novo) => setRelatorios((prev) => [novo, ...prev])}
          />
        }
      />

      <PageBody className="space-y-5">
        {/* indicadores reais — GET /painel/resumo */}
        {indicadores && (
          <section>
            <SectionTitle hint="GET /painel/resumo · todas as obras">Indicadores da operação</SectionTitle>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
              {indicadores.map((k) => (
                <div key={k.label} className="rounded-md border border-border bg-card px-4 py-3 shadow-panel">
                  <p className="tech-label">{k.label}</p>
                  <p className="mt-1 font-display text-[22px] font-700 leading-none tabular-nums text-navy-900">
                    {k.value}
                  </p>
                  <p className="mt-1 text-[11.5px] text-graphite-400">{k.hint}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* relatórios emitidos — GET /relatorios */}
        <section>
          <SectionTitle hint="snapshot congelado · hash SHA-256">Relatórios emitidos</SectionTitle>
          <RelatoriosEmitidos relatorios={relatorios} carregando={carregando} nomeObra={nomeObra} />
        </section>

        {/* gráficos derivados de dado real */}
        <div className="grid gap-5 xl:grid-cols-2">
          <ChartFrame
            title="NCs abertas por severidade"
            code="GET /painel/resumo · contagem atual"
            height={280}
            hint="Só não terminais: RESOLVIDA e CANCELADA ficam de fora da contagem."
          >
            <ResponsiveContainer width="100%" height={264}>
              <BarChart data={porSeveridade} margin={chartMargin}>
                <CartesianGrid stroke={chartAxis.grid} vertical={false} />
                <XAxis dataKey="severidade" tickLine={false} axisLine={{ stroke: chartAxis.stroke }} tick={chartAxis.tick} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={chartAxis.tick} width={32} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(21,103,179,0.05)' }} />
                <Bar isAnimationActive={false} dataKey="total" name="NCs" radius={[3, 3, 0, 0]} barSize={38}>
                  {porSeveridade.map((s) => (
                    <Cell key={s.severidade} fill={COR_SEVERIDADE[s.severidade] ?? chartCategorical[0]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>

          <ChartFrame
            title="NCs abertas por categoria de norma"
            code="GET /painel/resumo · distribuição"
            height={280}
            hint="NC sem requisito vinculado cai em NAO_CLASSIFICADA — nunca some da contagem."
          >
            <div className="flex h-[264px] items-center gap-4">
              <ResponsiveContainer width="52%" height="100%">
                <PieChart>
                  <Pie
                    isAnimationActive={false}
                    data={porCategoria}
                    dataKey="total"
                    nameKey="categoria"
                    innerRadius="58%"
                    outerRadius="88%"
                    paddingAngle={2}
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {porCategoria.map((c, i) => (
                      <Cell key={c.categoria} fill={chartCategorical[i % chartCategorical.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="flex-1 space-y-2 pr-2">
                {porCategoria.map((c, i) => (
                  <li key={c.categoria} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-[1px]"
                      style={{ background: chartCategorical[i % chartCategorical.length] }}
                    />
                    <span className="min-w-0 flex-1 truncate text-[12.5px] text-graphite-600">{c.categoria}</span>
                    <span className="font-mono text-[12px] tabular-nums text-graphite-900">{c.total}</span>
                  </li>
                ))}
                {porCategoria.length === 0 && <li className="text-[12.5px] text-graphite-400">Sem NC aberta.</li>}
              </ul>
            </div>
          </ChartFrame>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <ChartFrame
            title="Detecções por câmera"
            code="detectadas × confirmadas na triagem"
            height={280}
            legend={[
              { label: 'Detectadas', color: chartCategorical[0] },
              { label: 'Confirmadas', color: chartCategorical[1] },
            ]}
            hint="A distância entre as barras é o filtro do engenheiro sobre a recomendação da IA."
          >
            <ResponsiveContainer width="100%" height={264}>
              <BarChart data={porCamera} layout="vertical" margin={{ ...chartMargin, left: 8 }} barGap={2}>
                <CartesianGrid stroke={chartAxis.grid} horizontal={false} />
                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={{ stroke: chartAxis.stroke }} tick={chartAxis.tick} />
                <YAxis
                  type="category"
                  dataKey="camera"
                  tickLine={false}
                  axisLine={false}
                  tick={{ ...chartAxis.tick, fontSize: 10.5 }}
                  width={104}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(21,103,179,0.05)' }} />
                <Bar isAnimationActive={false} dataKey="detectadas" name="Detectadas" fill={chartCategorical[0]} radius={[0, 3, 3, 0]} barSize={9} />
                <Bar isAnimationActive={false} dataKey="confirmadas" name="Confirmadas" fill={chartCategorical[1]} radius={[0, 3, 3, 0]} barSize={9} />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>

          <ChartFrame
            title="Falso positivo por versão de modelo"
            code="GET /painel/resumo · % das triadas"
            height={280}
            hint="Isolado por versão de propósito: um modelo bom não pode diluir a taxa de um ruim."
          >
            <ResponsiveContainer width="100%" height={264}>
              <BarChart data={porModelo} margin={chartMargin}>
                <CartesianGrid stroke={chartAxis.grid} vertical={false} />
                <XAxis dataKey="modelo" tickLine={false} axisLine={{ stroke: chartAxis.stroke }} tick={{ ...chartAxis.tick, fontSize: 10 }} />
                <YAxis tickLine={false} axisLine={false} tick={chartAxis.tick} width={38} domain={[0, 100]} />
                <Tooltip content={<ChartTooltip suffix="%" />} cursor={{ fill: 'rgba(21,103,179,0.05)' }} />
                <ReferenceLine y={25} stroke={chartStatus.neutral} strokeDasharray="6 5" />
                <Bar isAnimationActive={false} dataKey="taxa" name="Falso positivo" radius={[3, 3, 0, 0]} barSize={30}>
                  {porModelo.map((m) => (
                    <Cell key={m.modelo} fill={m.taxa > 25 ? chartStatus.critical : chartStatus.success} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </div>

        <p className="rounded-md border border-dashed border-graphite-200 bg-graphite-50 px-4 py-3 text-[12.5px] text-graphite-500">
          <span className="font-600 text-graphite-700">Todos os números desta página vêm do backend.</span> Três gráficos
          que existiam aqui foram removidos por não terem fonte real: índice de conformidade mês a mês, MTTR mensal e
          falso positivo por semana. O backend agrega o <b>estado atual</b> (
          <code className="font-mono text-[11.5px]">/painel/resumo</code>) e não guarda histórico — uma série temporal
          exigiria uma tabela de snapshot que ainda não existe.
        </p>
      </PageBody>
    </>
  )
}
