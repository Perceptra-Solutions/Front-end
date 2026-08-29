import { Download } from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PageBody, PageHeader } from '@/components/shared/PageHeader'
import { ChartFrame, ChartTooltip } from '@/components/reports/ChartFrame'
import { Button } from '@/components/ui/button'
import { useToast } from '@/store/toast'
import {
  alertsByCamera,
  alertsByCategory,
  complianceSeries,
  falsePositiveTrend,
  modelPerformance,
  ncByType,
  resolutionTime,
} from '@/data/analytics'
import { chartAxis, chartCategorical, chartMargin, chartStatus } from '@/lib/chartTheme'
import { pct } from '@/lib/utils'

export default function Reports() {
  const { push } = useToast()

  return (
    <>
      <PageHeader
        eyebrow="Análise · Período MAR–AGO 2026"
        title="Relatórios e indicadores"
        description="Leitura consolidada da operação: conformidade, resposta às ocorrências e desempenho dos modelos de visão computacional."
        meta={[
          { label: 'Obra', value: 'OBR-2025-014' },
          { label: 'Emissão', value: '28/08/2026' },
        ]}
        actions={
          <Button
            variant="navy"
            size="sm"
            onClick={() =>
              push({
                tone: 'success',
                title: 'Relatório emitido',
                description: 'REL-2026-0834 · PDF assinado com hash SHA-256.',
              })
            }
          >
            <Download className="h-3.5 w-3.5" />
            Emitir relatório
          </Button>
        }
      />

      <PageBody className="space-y-5">
        {/* linha 1 */}
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <ChartFrame
            title="Índice de conformidade"
            code="IND-CONF-01 · % por mês"
            height={260}
            legend={[{ label: 'Conformidade', color: chartCategorical[0] }]}
            hint="A linha tracejada é a meta contratual de 92%. Agosto fechou 2,2 pontos acima."
          >
            <ResponsiveContainer width="100%" height={244}>
              <AreaChart data={complianceSeries} margin={chartMargin}>
                <defs>
                  <linearGradient id="grad-conf-rep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartCategorical[0]} stopOpacity={0.24} />
                    <stop offset="100%" stopColor={chartCategorical[0]} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={chartAxis.grid} vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: chartAxis.stroke }} tick={chartAxis.tick} />
                <YAxis domain={[84, 98]} tickLine={false} axisLine={false} tick={chartAxis.tick} width={38} />
                <Tooltip content={<ChartTooltip suffix="%" />} cursor={{ stroke: chartAxis.stroke, strokeDasharray: '4 4' }} />
                <ReferenceLine y={92} stroke={chartStatus.neutral} strokeDasharray="6 5" />
                <Area
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="conformidade"
                  name="Conformidade"
                  stroke={chartCategorical[0]}
                  strokeWidth={2}
                  fill="url(#grad-conf-rep)"
                  dot={{ r: 3, strokeWidth: 0, fill: chartCategorical[0] }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartFrame>

          <ChartFrame
            title="Não conformidades por tipo"
            code="IND-NC-05 · distribuição"
            height={260}
            hint="Segurança do trabalho concentra 38% dos registros do período."
          >
            <div className="flex h-[244px] items-center gap-4">
              <ResponsiveContainer width="52%" height="100%">
                <PieChart>
                  <Pie
                    isAnimationActive={false}
                    data={ncByType}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="58%"
                    outerRadius="88%"
                    paddingAngle={2}
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {ncByType.map((entry, i) => (
                      <Cell key={entry.name} fill={chartCategorical[i % chartCategorical.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="flex-1 space-y-2 pr-2">
                {ncByType.map((n, i) => (
                  <li key={n.name} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-[1px]" style={{ background: chartCategorical[i] }} />
                    <span className="min-w-0 flex-1 truncate text-[12.5px] text-graphite-600">{n.name}</span>
                    <span className="font-mono text-[12px] tabular-nums text-graphite-900">{n.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ChartFrame>
        </div>

        {/* linha 2 */}
        <div className="grid gap-5 xl:grid-cols-2">
          <ChartFrame
            title="Alertas por categoria"
            code="IND-ALT-06 · detectados x confirmados"
            height={280}
            legend={[
              { label: 'Detectados', color: chartCategorical[0] },
              { label: 'Confirmados na triagem', color: chartCategorical[1] },
            ]}
            hint="A distância entre as barras é o filtro do engenheiro sobre a recomendação da IA."
          >
            <ResponsiveContainer width="100%" height={264}>
              <BarChart data={alertsByCategory} layout="vertical" margin={{ ...chartMargin, left: 8 }} barGap={2}>
                <CartesianGrid stroke={chartAxis.grid} horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={{ stroke: chartAxis.stroke }} tick={chartAxis.tick} />
                <YAxis
                  type="category"
                  dataKey="categoria"
                  tickLine={false}
                  axisLine={false}
                  tick={{ ...chartAxis.tick, fontSize: 10.5 }}
                  width={104}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(21,103,179,0.05)' }} />
                <Bar
                  isAnimationActive={false}
                  dataKey="total"
                  name="Detectados"
                  fill={chartCategorical[0]}
                  radius={[0, 3, 3, 0]}
                  barSize={9}
                />
                <Bar
                  isAnimationActive={false}
                  dataKey="confirmados"
                  name="Confirmados"
                  fill={chartCategorical[1]}
                  radius={[0, 3, 3, 0]}
                  barSize={9}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>

          <ChartFrame
            title="Alertas por câmera"
            code="IND-CAM-07 · acumulado do mês"
            height={280}
            hint="CAM-07 e CAM-09 concentram as frentes de laje e fachada — as de maior risco no momento."
          >
            <ResponsiveContainer width="100%" height={264}>
              <BarChart data={alertsByCamera} margin={chartMargin}>
                <CartesianGrid stroke={chartAxis.grid} vertical={false} />
                <XAxis
                  dataKey="camera"
                  tickLine={false}
                  axisLine={{ stroke: chartAxis.stroke }}
                  tick={{ ...chartAxis.tick, fontSize: 10 }}
                />
                <YAxis tickLine={false} axisLine={false} tick={chartAxis.tick} width={32} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(21,103,179,0.05)' }} />
                <Bar
                  isAnimationActive={false}
                  dataKey="alertas"
                  name="Alertas"
                  fill={chartCategorical[0]}
                  radius={[3, 3, 0, 0]}
                  barSize={22}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </div>

        {/* linha 3 */}
        <div className="grid gap-5 xl:grid-cols-3">
          <ChartFrame
            title="Tempo médio de resolução"
            code="IND-MTTR-08 · dias"
            height={230}
            hint="Queda de 6,8 para 3,4 dias desde março."
          >
            <ResponsiveContainer width="100%" height={214}>
              <LineChart data={resolutionTime} margin={chartMargin}>
                <CartesianGrid stroke={chartAxis.grid} vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: chartAxis.stroke }} tick={chartAxis.tick} />
                <YAxis tickLine={false} axisLine={false} tick={chartAxis.tick} width={30} />
                <Tooltip content={<ChartTooltip suffix=" d" />} cursor={{ stroke: chartAxis.stroke, strokeDasharray: '4 4' }} />
                <Line
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="dias"
                  name="Dias"
                  stroke={chartCategorical[1]}
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 0, fill: chartCategorical[1] }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartFrame>

          <ChartFrame
            title="Taxa de falsos positivos"
            code="IND-FP-09 · % por semana"
            height={230}
            hint="Cada descarte registrado alimenta o retreino e derruba a taxa."
          >
            <ResponsiveContainer width="100%" height={214}>
              <AreaChart data={falsePositiveTrend} margin={chartMargin}>
                <defs>
                  <linearGradient id="grad-fp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartCategorical[2]} stopOpacity={0.24} />
                    <stop offset="100%" stopColor={chartCategorical[2]} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={chartAxis.grid} vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={{ stroke: chartAxis.stroke }} tick={chartAxis.tick} />
                <YAxis tickLine={false} axisLine={false} tick={chartAxis.tick} width={32} />
                <Tooltip content={<ChartTooltip suffix="%" />} cursor={{ stroke: chartAxis.stroke, strokeDasharray: '4 4' }} />
                <Area
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="taxa"
                  name="Falsos positivos"
                  stroke={chartCategorical[2]}
                  strokeWidth={2}
                  fill="url(#grad-fp)"
                  dot={{ r: 3, strokeWidth: 0, fill: chartCategorical[2] }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartFrame>

          <ChartFrame
            title="Desempenho dos modelos"
            code="IND-IA-10 · precision · recall · F1"
            height={230}
            legend={[
              { label: 'Precision', color: chartCategorical[0] },
              { label: 'Recall', color: chartCategorical[1] },
              { label: 'F1', color: chartCategorical[3] },
            ]}
          >
            <ResponsiveContainer width="100%" height={214}>
              <BarChart data={modelPerformance} margin={chartMargin} barGap={2}>
                <CartesianGrid stroke={chartAxis.grid} vertical={false} />
                <XAxis
                  dataKey="modelo"
                  tickLine={false}
                  axisLine={{ stroke: chartAxis.stroke }}
                  tick={{ ...chartAxis.tick, fontSize: 10 }}
                />
                <YAxis domain={[70, 100]} tickLine={false} axisLine={false} tick={chartAxis.tick} width={34} />
                <Tooltip content={<ChartTooltip suffix="%" />} cursor={{ fill: 'rgba(21,103,179,0.05)' }} />
                <Bar
                  isAnimationActive={false}
                  dataKey="precision"
                  name="Precision"
                  fill={chartCategorical[0]}
                  radius={[3, 3, 0, 0]}
                  barSize={12}
                />
                <Bar
                  isAnimationActive={false}
                  dataKey="recall"
                  name="Recall"
                  fill={chartCategorical[1]}
                  radius={[3, 3, 0, 0]}
                  barSize={12}
                />
                <Bar
                  isAnimationActive={false}
                  dataKey="f1"
                  name="F1"
                  fill={chartCategorical[3]}
                  radius={[3, 3, 0, 0]}
                  barSize={12}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </div>

        {/* leitura em números */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: 'Conformidade atual', value: pct(94.2), hint: 'meta 92,0%' },
            { label: 'Redução do MTTR', value: '−50%', hint: 'de 6,8 para 3,4 dias' },
            { label: 'Falsos positivos', value: pct(7.1), hint: 'era 14,2% em julho' },
            { label: 'Custo de retrabalho', value: 'R$ 17.230', hint: 'acumulado no mês' },
          ].map((k) => (
            <div key={k.label} className="rounded-md border border-border bg-card px-4 py-3 shadow-panel">
              <p className="tech-label">{k.label}</p>
              <p className="mt-1 font-display text-[24px] font-700 leading-none tabular-nums text-navy-900">{k.value}</p>
              <p className="mt-1 text-[12px] text-graphite-400">{k.hint}</p>
            </div>
          ))}
        </div>
      </PageBody>
    </>
  )
}
