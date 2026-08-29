import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartFrame, ChartTooltip } from '@/components/reports/ChartFrame'
import { dailyDetections } from '@/data/analytics'
import { chartAxis, chartCategorical, chartMargin } from '@/lib/chartTheme'

/** Volume de detecções ao longo do turno e quanto disso o engenheiro confirmou. */
export function DetectionActivityChart() {
  return (
    <ChartFrame
      title="Atividade da IA no turno"
      code="IND-DET-24H"
      height={216}
      legend={[
        { label: 'Detecções', color: chartCategorical[0] },
        { label: 'Confirmadas', color: chartCategorical[1] },
      ]}
      hint="A diferença entre as duas linhas é o filtro humano: o que a IA aponta e o engenheiro não confirma."
    >
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={dailyDetections} margin={chartMargin}>
          <defs>
            <linearGradient id="grad-det" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartCategorical[0]} stopOpacity={0.22} />
              <stop offset="100%" stopColor={chartCategorical[0]} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="grad-conf" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartCategorical[1]} stopOpacity={0.22} />
              <stop offset="100%" stopColor={chartCategorical[1]} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={chartAxis.grid} vertical={false} />
          <XAxis dataKey="hora" tickLine={false} axisLine={{ stroke: chartAxis.stroke }} tick={chartAxis.tick} />
          <YAxis tickLine={false} axisLine={false} tick={chartAxis.tick} width={34} />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: chartAxis.stroke, strokeDasharray: '4 4' }} />
          <Area
            isAnimationActive={false}
            type="monotone"
            dataKey="deteccoes"
            name="Detecções"
            stroke={chartCategorical[0]}
            strokeWidth={2}
            fill="url(#grad-det)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
          />
          <Area
            isAnimationActive={false}
            type="monotone"
            dataKey="confirmadas"
            name="Confirmadas"
            stroke={chartCategorical[1]}
            strokeWidth={2}
            fill="url(#grad-conf)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}
