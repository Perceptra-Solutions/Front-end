import { Link } from 'react-router-dom'
import { Building2, ClipboardList, Mail, ShieldCheck } from 'lucide-react'
import { PageBody, PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EventTimeline } from '@/components/action-plans/EventTimeline'
import { currentUser } from '@/data/users'
import { useAppStore } from '@/store/AppStore'
import { formatDate, formatTime } from '@/lib/utils'

export default function Profile() {
  const { alerts, nonConformities } = useAppStore()

  const triaged = alerts.filter((a) => a.reviewedBy === currentUser.name)
  const owned = nonConformities.filter((n) => n.responsible === currentUser.name)

  return (
    <>
      <PageHeader
        eyebrow="Conta · Responsável técnico"
        title="Perfil"
        description="Registro do profissional que assina as decisões de triagem e verificação nesta obra."
        meta={[{ label: 'Último acesso', value: formatTime(currentUser.lastAccess) }]}
      />

      <PageBody className="grid max-w-5xl gap-5 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <Card>
          <CardContent className="space-y-4 py-5">
            <div className="flex items-center gap-3">
              <Avatar name={currentUser.name} size="lg" />
              <div className="min-w-0">
                <p className="truncate font-display text-[17.5px] font-600 uppercase tracking-[0.01em] text-navy-900">
                  {currentUser.name}
                </p>
                <p className="text-[13px] text-graphite-500">{currentUser.roleLabel}</p>
              </div>
            </div>

            <dl className="space-y-3 border-t border-border pt-4">
              <div className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-3.5 w-3.5 text-graphite-300" />
                <div className="min-w-0">
                  <dt className="tech-label">E-mail</dt>
                  <dd className="truncate text-[13px] text-graphite-700">{currentUser.email}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 text-graphite-300" />
                <div>
                  <dt className="tech-label">Registro profissional</dt>
                  <dd className="font-mono text-[13px] text-graphite-700">{currentUser.crea}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Building2 className="mt-0.5 h-3.5 w-3.5 text-graphite-300" />
                <div>
                  <dt className="tech-label">Obras</dt>
                  <dd className="text-[13px] text-graphite-700">{currentUser.works.join(' · ')}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <ClipboardList className="mt-0.5 h-3.5 w-3.5 text-graphite-300" />
                <div>
                  <dt className="tech-label">Ações em aberto</dt>
                  <dd className="font-mono text-[13px] text-graphite-700">{currentUser.openActions}</dd>
                </div>
              </div>
            </dl>

            <div className="flex items-center gap-2 border-t border-border pt-4">
              <Badge variant="success">Ativo</Badge>
              <Button asChild variant="outline" size="xs" className="ml-auto">
                <Link to="/settings">Configurações</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex min-w-0 flex-col gap-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Triagens hoje', value: triaged.length },
              { label: 'NCs sob responsabilidade', value: owned.length },
              { label: 'Verificações no mês', value: 14 },
            ].map((k) => (
              <div key={k.label} className="rounded-md border border-border bg-card px-4 py-3 shadow-panel">
                <p className="tech-label">{k.label}</p>
                <p className="mt-1 font-display text-[24px] font-700 leading-none tabular-nums text-navy-900">
                  {String(k.value).padStart(2, '0')}
                </p>
              </div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Atividade recente</CardTitle>
            </CardHeader>
            <CardContent>
              <EventTimeline
                events={[
                  { time: '17:26', date: '28/08', label: 'Ação enviada para verificação', detail: 'PA-0089 · quadro QD-SS01', author: 'Sistema', kind: 'system' },
                  { time: '16:49', date: '28/08', label: 'Detecção confirmada', detail: 'ALT-2026-0837 · gerou NC-00125', author: currentUser.name, kind: 'engineer' },
                  { time: '16:20', date: '28/08', label: 'Detecção confirmada', detail: 'ALT-2026-0836 · gerou NC-00126', author: currentUser.name, kind: 'engineer' },
                  { time: '15:52', date: '28/08', label: 'Falso positivo registrado', detail: 'ALT-2026-0835 · veículo em horário restrito', author: currentUser.name, kind: 'engineer' },
                  { time: '15:04', date: '28/08', label: 'Detecção confirmada', detail: 'ALT-2026-0833 · gerou NC-00127', author: currentUser.name, kind: 'engineer' },
                ]}
              />
              <p className="mt-4 border-t border-border pt-3 font-mono text-[10.5px] uppercase tracking-[0.1em] text-graphite-400">
                Último acesso · {formatDate(currentUser.lastAccess)} {formatTime(currentUser.lastAccess)}
              </p>
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </>
  )
}
