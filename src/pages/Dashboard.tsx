import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Camera, ClipboardCheck, ShieldCheck, Siren, TriangleAlert } from 'lucide-react'
import { PageBody, PageHeader, SectionTitle } from '@/components/shared/PageHeader'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { WorkProgressPanel } from '@/components/dashboard/WorkProgressPanel'
import { ModelStatusPanel } from '@/components/dashboard/ModelStatusPanel'
import { DetectionActivityChart } from '@/components/dashboard/DetectionActivityChart'
import { AlertCard } from '@/components/alerts/AlertCard'
import { NCTable } from '@/components/nonconformities/NCTable'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/store/AppStore'
import { currentWork } from '@/data/works'
import { formatDateTechnical, pct } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { alerts, nonConformities, actionPlans, kpis } = useAppStore()
  const navigate = useNavigate()
  const [clock, setClock] = React.useState(() => new Date())

  React.useEffect(() => {
    const id = window.setInterval(() => setClock(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const criticalPending = alerts.filter((a) => a.status === 'pending' && a.severity === 'critical')
  const latestAlerts = alerts.filter((a) => a.status === 'pending').slice(0, 3)
  const openNCs = nonConformities.filter((n) => n.status !== 'resolved').slice(0, 5)

  return (
    <>
      <PageHeader
        eyebrow={`Visão geral · ${currentWork.code}`}
        title={currentWork.name}
        description="Monitoramento inteligente de qualidade, segurança e conformidade."
        meta={[
          { label: 'Data', value: formatDateTechnical(clock) },
          { label: 'Hora', value: clock.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) },
        ]}
        actions={
          <Button asChild variant="navy" size="sm">
            <Link to="/alerts">
              Central de alertas
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        }
      />

      <PageBody className="space-y-7">
        {/* faixa de indicadores */}
        <section>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="Índice de conformidade"
              code="IND-CONF-01"
              value={pct(kpis.compliance).replace('%', '')}
              unit="%"
              hint="Meta do contrato: 92,0%"
              icon={ShieldCheck}
              tone="success"
              trend={{ value: '3,4%', direction: 'up', positive: true }}
              spark={[88.4, 89.9, 90.6, 91.8, 90.8, 94.2]}
            />
            <KpiCard
              label="Alertas ativos"
              code="IND-ALT-02"
              value={String(kpis.activeAlerts).padStart(2, '0')}
              hint={`${kpis.criticalAlerts} críticos aguardando triagem`}
              icon={Siren}
              tone="critical"
              spark={[6, 9, 7, 11, 10, kpis.activeAlerts]}
            />
            <KpiCard
              label="Não conformidades"
              code="IND-NC-03"
              value={String(kpis.openNCs).padStart(2, '0')}
              hint={`${kpis.dueToday} vencendo hoje`}
              icon={TriangleAlert}
              tone="warning"
              spark={[11, 10, 9, 8, 8, kpis.openNCs]}
            />
            <KpiCard
              label="Câmeras online"
              code="IND-CAM-04"
              value={`${kpis.camerasOnline}`}
              unit={`/ ${kpis.camerasTotal}`}
              hint={`${kpis.camerasTotal > 0 ? Math.round((kpis.camerasOnline / kpis.camerasTotal) * 100) : 0}% do parque operacional`}
              icon={Camera}
              tone="neutral"
              spark={[20, 19, 20, 18, 19, kpis.camerasOnline]}
            />
          </div>
        </section>

        {/* alertas + contexto da obra */}
        <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <div className="min-w-0">
            <SectionTitle hint={`${kpis.activeAlerts} pendentes de triagem`}>Central de alertas</SectionTitle>
            <p className="-mt-1 mb-3 text-[13.5px] text-graphite-500">
              Ocorrências detectadas automaticamente pela inteligência artificial. A decisão continua sendo do engenheiro.
            </p>

            {criticalPending.length > 0 && (
              <div className="mb-4 flex items-center gap-3 rounded-md border border-status-critical/30 bg-status-critical-bg px-4 py-3">
                <span className="flex h-8 w-8 shrink-0 animate-pulse-alert items-center justify-center rounded-[3px] bg-status-critical text-white">
                  <Siren className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[14px] font-600 uppercase tracking-[0.1em] text-status-critical">
                    {criticalPending.length} ocorrência{criticalPending.length > 1 ? 's' : ''} crítica
                    {criticalPending.length > 1 ? 's' : ''} sem triagem
                  </p>
                  <p className="text-[12.5px] text-graphite-600">
                    {criticalPending.map((a) => `${a.cameraCode} · ${a.locationCode}`).join('   ·   ')}
                  </p>
                </div>
                <Button asChild variant="destructive" size="sm" className="shrink-0">
                  <Link to={`/alerts/${criticalPending[0].id}`}>Analisar agora</Link>
                </Button>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {latestAlerts.map((a) => (
                <AlertCard key={a.id} alert={a} />
              ))}
            </div>

            <Button asChild variant="outline" size="sm" className="mt-3 w-full">
              <Link to="/alerts">
                Ver todas as {alerts.length} ocorrências do dia
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          <div className="flex min-w-0 flex-col gap-6">
            <WorkProgressPanel />
            <ModelStatusPanel />
          </div>
        </section>

        {/* NCs + atividade */}
        <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Não conformidades em aberto</CardTitle>
              <Button asChild variant="ghost" size="xs">
                <Link to="/non-conformities">
                  Ver todas
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <NCTable items={openNCs} compact onSelect={() => navigate('/non-conformities')} />
          </Card>

          <div className="flex min-w-0 flex-col gap-6">
            <DetectionActivityChart />
            <Card>
              <CardHeader>
                <CardTitle>Ciclo em andamento</CardTitle>
                <ClipboardCheck className="h-4 w-4 text-graphite-300" />
              </CardHeader>
              <div className="divide-y divide-border">
                {[
                  { label: 'Detecções aguardando triagem', value: kpis.activeAlerts, to: '/alerts' },
                  { label: 'NCs sem plano de ação', value: nonConformities.filter((n) => n.status === 'open').length, to: '/non-conformities' },
                  {
                    label: 'Ações aguardando verificação',
                    value: actionPlans.filter((p) => p.status === 'verification').length,
                    to: '/action-plans',
                  },
                ].map((row) => (
                  <Link
                    key={row.label}
                    to={row.to}
                    className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-technical-100/40"
                  >
                    <span className="text-[13.5px] text-graphite-600">{row.label}</span>
                    <span className="font-mono text-[16px] font-600 tabular-nums text-navy-900">
                      {String(row.value).padStart(2, '0')}
                    </span>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </section>
      </PageBody>
    </>
  )
}
