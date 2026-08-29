import * as React from 'react'
import { Siren } from 'lucide-react'
import { PageBody, PageHeader } from '@/components/shared/PageHeader'
import { AlertCard, categoryLabel } from '@/components/alerts/AlertCard'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/store/AppStore'
import { cameras } from '@/data/cameras'
import type { Alert, AlertStatus } from '@/types'

type SeverityFilter = 'all' | Alert['severity']

export default function Alerts() {
  const { alerts, kpis } = useAppStore()
  const [status, setStatus] = React.useState<AlertStatus | 'all'>('pending')
  const [severity, setSeverity] = React.useState<SeverityFilter>('all')
  const [camera, setCamera] = React.useState('all')
  const [category, setCategory] = React.useState('all')

  const filtered = alerts.filter((a) => {
    if (status !== 'all' && a.status !== status) return false
    if (severity !== 'all' && a.severity !== severity) return false
    if (camera !== 'all' && a.cameraCode !== camera) return false
    if (category !== 'all' && a.category !== category) return false
    return true
  })

  const counts = {
    all: alerts.length,
    pending: alerts.filter((a) => a.status === 'pending').length,
    confirmed: alerts.filter((a) => a.status === 'confirmed').length,
    dismissed: alerts.filter((a) => a.status === 'dismissed').length,
  }

  return (
    <>
      <PageHeader
        eyebrow="Operação · Visão computacional"
        title="Central de alertas"
        description="Ocorrências detectadas automaticamente pela inteligência artificial. Cada uma passa pela triagem de um engenheiro antes de virar não conformidade."
        meta={[
          { label: 'Pendentes', value: String(kpis.activeAlerts).padStart(2, '0') },
          { label: 'Críticos', value: String(kpis.criticalAlerts).padStart(2, '0') },
          { label: 'Detecções hoje', value: String(alerts.length) },
        ]}
      />

      <PageBody className="space-y-5">
        {/* filtros */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Tabs value={status} onValueChange={(v) => setStatus(v as AlertStatus | 'all')}>
            <TabsList>
              <TabsTrigger value="pending">Aguardando triagem · {counts.pending}</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmadas · {counts.confirmed}</TabsTrigger>
              <TabsTrigger value="dismissed">Falso positivo · {counts.dismissed}</TabsTrigger>
              <TabsTrigger value="all">Todas · {counts.all}</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={severity} onValueChange={(v) => setSeverity(v as SeverityFilter)}>
              <SelectTrigger className="w-[152px]">
                <SelectValue placeholder="Severidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toda severidade</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
                <SelectItem value="warning">Atenção</SelectItem>
                <SelectItem value="info">Informativo</SelectItem>
              </SelectContent>
            </Select>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[176px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toda categoria</SelectItem>
                {Object.entries(categoryLabel).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={camera} onValueChange={setCamera}>
              <SelectTrigger className="w-[148px]">
                <SelectValue placeholder="Câmera" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as câmeras</SelectItem>
                {cameras.slice(0, 12).map((c) => (
                  <SelectItem key={c.id} value={c.code}>
                    {c.code} · {c.locationCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* lista */}
        <div className="flex flex-col gap-3">
          {filtered.map((a) => (
            <AlertCard key={a.id} alert={a} />
          ))}
        </div>

        {filtered.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
              <Siren className="h-7 w-7 text-graphite-300" />
              <p className="font-display text-[14px] font-600 uppercase tracking-[0.07em] text-graphite-500">
                Nenhuma ocorrência com esses filtros
              </p>
              <p className="text-[13px] text-graphite-400">Ajuste a severidade, a câmera ou a categoria para ampliar a busca.</p>
            </CardContent>
          </Card>
        )}
      </PageBody>
    </>
  )
}
