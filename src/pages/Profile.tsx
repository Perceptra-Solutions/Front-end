import { Link } from 'react-router-dom'
import { ClipboardList, Mail, ShieldCheck } from 'lucide-react'
import { PageBody, PageHeader } from '@/components/shared/PageHeader'
import { SemDadoNoBackend } from '@/components/shared/EstadoPagina'
import { EventTimeline } from '@/components/action-plans/EventTimeline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/AppStore'


export default function Profile() {
  const { alerts, nonConformities, actionPlans, usuario, loading } = useAppStore()

  // Tudo comparado pelo nome real do usuário do token (`/auth/eu`), não por
  // um "Marcos Andrade" fixo que nem existia no banco.
  const nome = usuario?.nome ?? ''
  const triadas = alerts.filter((a) => a.reviewedBy === nome)
  const sobResponsabilidade = nonConformities.filter((n) => n.responsible === nome)
  const executadas = actionPlans.filter((p) => p.executor === nome)

  const atividade = triadas
    .filter((a) => a.reviewedAt)
    .sort((a, b) => new Date(b.reviewedAt!).getTime() - new Date(a.reviewedAt!).getTime())
    .slice(0, 6)
    .map((a) => {
      const quando = new Date(a.reviewedAt!)
      return {
        time: quando.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        date: quando.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        label: a.status === 'confirmed' ? 'Detecção confirmada' : 'Registrada como falso positivo',
        detail: `${a.detectionClass} · ${a.cameraCode}`,
        author: nome,
        kind: 'engineer' as const,
      }
    })

  return (
    <>
      <PageHeader
        eyebrow="Conta · Responsável técnico"
        title="Perfil"
        description="Registro do profissional que assina as decisões de triagem e verificação nesta obra."
        meta={[{ label: 'Papel', value: usuario?.papel ?? '—' }]}
      />

      <PageBody className="grid max-w-5xl gap-5 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <Card>
          <CardContent className="space-y-4 py-5">
            <div className="flex items-center gap-3">
              <Avatar name={usuario?.nome ?? '—'} size="lg" />
              <div className="min-w-0">
                <p className="truncate font-display text-[17.5px] font-600 uppercase tracking-[0.01em] text-navy-900">
                  {usuario?.nome ?? (loading ? 'Carregando…' : '—')}
                </p>
                <p className="text-[13px] text-graphite-500">
                  {usuario?.papel === 'GESTOR' ? 'Gestor' : 'Engenheiro responsável'}
                </p>
              </div>
            </div>

            <dl className="space-y-3 border-t border-border pt-4">
              <div className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-3.5 w-3.5 text-graphite-300" />
                <div className="min-w-0">
                  <dt className="tech-label">E-mail</dt>
                  <dd className="truncate text-[13px] text-graphite-700">{usuario?.email ?? '—'}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 text-graphite-300" />
                <div>
                  <dt className="tech-label">Registro profissional</dt>
                  <dd className="font-mono text-[13px] text-graphite-700">{usuario?.crea ?? '—'}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <ClipboardList className="mt-0.5 h-3.5 w-3.5 text-graphite-300" />
                <div>
                  <dt className="tech-label">Ações executadas</dt>
                  <dd className="font-mono text-[13px] text-graphite-700">{executadas.length}</dd>
                </div>
              </div>
            </dl>

            <div className="flex items-center gap-2 border-t border-border pt-4">
              <Badge variant="success">Autenticado</Badge>
              <Button asChild variant="outline" size="xs" className="ml-auto">
                <Link to="/settings">Configurações</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex min-w-0 flex-col gap-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Detecções triadas', value: triadas.length },
              { label: 'NCs sob responsabilidade', value: sobResponsabilidade.length },
              { label: 'Ações executadas', value: executadas.length },
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
              {/*
                Atividade real: as detecções que ESTE usuário triou, mais
                recentes primeiro. A versão anterior tinha cinco eventos
                escritos à mão (ALT-2026-0837, NC-00125…) que não existiam no
                banco e nunca mudavam.
              */}
              {atividade.length === 0 ? (
                <p className="text-[13px] text-graphite-400">
                  {loading ? 'Carregando…' : 'Nenhuma triagem registrada por este usuário ainda.'}
                </p>
              ) : (
                <EventTimeline events={atividade} />
              )}
              <SemDadoNoBackend>
                A trilha mostra apenas triagens. O histórico completo por usuário exigiria consultar{' '}
                <code className="font-mono text-[11.5px]">/nao-conformidades/:id/historico</code> de cada NC — o backend
                não tem rota de auditoria por ator.
              </SemDadoNoBackend>
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </>
  )
}
