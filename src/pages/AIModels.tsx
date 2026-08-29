import { Activity, Cpu, Gauge, Timer } from 'lucide-react'
import { PageBody, PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { aiModels } from '@/data/aiModels'
import { cameras } from '@/data/cameras'
import { formatDate, pct } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function AIModels() {
  return (
    <>
      <PageHeader
        eyebrow="Inteligência artificial · Inferência"
        title="Modelos de IA"
        description="Os modelos que rodam nas câmeras da obra. O limiar de confiança é o botão que regula quanto ruído chega ao engenheiro."
        meta={[
          { label: 'Modelos', value: String(aiModels.length) },
          { label: 'Detecções hoje', value: String(aiModels.reduce((s, m) => s + m.detectionsToday, 0)) },
        ]}
      />

      <PageBody className="space-y-5">
        <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {aiModels.map((m) => {
            const modelCameras = cameras.filter((c) => c.aiModelCode === m.code)
            return (
              <Card key={m.id}>
                <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3.5">
                  <div className="min-w-0">
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-graphite-400">{m.code}</p>
                    <h3 className="mt-0.5 font-display text-[18px] font-700 uppercase tracking-[0.02em] text-navy-900">
                      {m.name}
                    </h3>
                    <p className="mt-0.5 text-[13px] text-graphite-500">{m.purpose}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <Badge variant={m.status === 'active' ? 'success' : m.status === 'training' ? 'warning' : 'default'}>
                      {m.status === 'active' ? 'Ativo' : m.status === 'training' ? 'Em treino' : 'Descontinuado'}
                    </Badge>
                    <span className="font-mono text-[13px] font-600 text-technical-700">{m.version}</span>
                  </div>
                </div>

                <CardContent className="space-y-4">
                  {/* métricas */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Precision', value: m.precision },
                      { label: 'Recall', value: m.recall },
                      { label: 'F1', value: m.f1 },
                    ].map((metric) => (
                      <div key={metric.label} className="rounded-[3px] border border-border bg-graphite-50 px-3 py-2">
                        <p className="tech-label">{metric.label}</p>
                        <p className="mt-0.5 font-mono text-[17px] font-600 tabular-nums text-navy-900">{pct(metric.value)}</p>
                        <Progress
                          value={metric.value}
                          className="mt-1.5 h-[3px]"
                          indicatorClassName={cn(metric.value >= 92 ? 'bg-status-success' : 'bg-status-warning')}
                        />
                      </div>
                    ))}
                  </div>

                  {/* operação */}
                  <dl className="grid grid-cols-2 gap-3 border-t border-border pt-3">
                    <div className="flex items-start gap-2">
                      <Gauge className="mt-0.5 h-3.5 w-3.5 text-graphite-300" />
                      <div>
                        <dt className="tech-label">Limiar de confiança</dt>
                        <dd className="font-mono text-[13.5px] tabular-nums text-graphite-900">{(m.threshold * 100).toFixed(0)}%</dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Timer className="mt-0.5 h-3.5 w-3.5 text-graphite-300" />
                      <div>
                        <dt className="tech-label">Latência média</dt>
                        <dd className="font-mono text-[13.5px] tabular-nums text-graphite-900">{m.latencyMs} ms</dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Activity className="mt-0.5 h-3.5 w-3.5 text-graphite-300" />
                      <div>
                        <dt className="tech-label">Detecções hoje</dt>
                        <dd className="font-mono text-[13.5px] tabular-nums text-graphite-900">{m.detectionsToday}</dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Cpu className="mt-0.5 h-3.5 w-3.5 text-graphite-300" />
                      <div>
                        <dt className="tech-label">Câmeras</dt>
                        <dd className="font-mono text-[13.5px] tabular-nums text-graphite-900">{modelCameras.length}</dd>
                      </div>
                    </div>
                  </dl>

                  {/* triagem */}
                  <div className="rounded-[3px] border border-border p-3">
                    <div className="flex items-baseline justify-between">
                      <span className="tech-label">Confirmadas na triagem</span>
                      <span className="font-mono text-[13px] font-600 tabular-nums text-status-success">{pct(m.confirmedRate)}</span>
                    </div>
                    <Progress value={m.confirmedRate} className="mt-2 h-1.5" indicatorClassName="bg-status-success" />
                    <p className="mt-2 text-[12.5px] text-graphite-500">
                      Falsos positivos: <span className="font-mono text-status-warning">{pct(m.falsePositiveRate)}</span> — cada
                      descarte registrado pelo engenheiro volta como dado rotulado para o próximo treino.
                    </p>
                  </div>

                  {/* classes */}
                  <div>
                    <p className="tech-label mb-1.5">Classes detectadas</p>
                    <div className="flex flex-wrap gap-1.5">
                      {m.classes.map((c) => (
                        <span
                          key={c}
                          className="rounded-[2px] border border-graphite-200 bg-white px-1.5 py-0.5 font-mono text-[10px] tracking-[0.06em] text-graphite-600"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="border-t border-border pt-3 font-mono text-[10.5px] uppercase tracking-[0.1em] text-graphite-400">
                    Publicado em {formatDate(m.publishedAt)}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="rounded-md border border-navy-800/15 bg-navy-800/[0.04] px-4 py-3.5">
          <p className="font-display text-[13px] font-600 uppercase tracking-[0.12em] text-navy-900">
            Por que a IA não fecha a ocorrência sozinha
          </p>
          <p className="mt-1 max-w-4xl text-[13.5px] leading-relaxed text-graphite-600">
            Nenhum modelo aqui passa de 95% de precisão. Numa obra, um falso positivo interdita uma frente de serviço sem
            necessidade e um falso negativo deixa um risco em pé. Por isso a saída do modelo é uma recomendação com evidência
            anexada: quem assina a não conformidade é o engenheiro responsável, com nome, CREA e horário registrados.
          </p>
        </div>
      </PageBody>
    </>
  )
}
