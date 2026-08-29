import * as React from 'react'
import { Download, Filter, Search } from 'lucide-react'
import { PageBody, PageHeader } from '@/components/shared/PageHeader'
import { NCTable } from '@/components/nonconformities/NCTable'
import { NCDetailDrawer } from '@/components/nonconformities/NCDetailDrawer'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/AppStore'
import { useToast } from '@/store/toast'
import { cn } from '@/lib/utils'
import type { NonConformity, NonConformityStatus } from '@/types'

export default function NonConformities() {
  const { nonConformities } = useAppStore()
  const { push } = useToast()
  const [status, setStatus] = React.useState<NonConformityStatus | 'all'>('all')
  const [severity, setSeverity] = React.useState('all')
  const [block, setBlock] = React.useState('all')
  const [query, setQuery] = React.useState('')
  const [selected, setSelected] = React.useState<NonConformity | null>(null)

  const blocks = Array.from(new Set(nonConformities.map((n) => n.blockCode)))

  const filtered = nonConformities.filter((n) => {
    if (status !== 'all' && n.status !== status) return false
    if (severity !== 'all' && n.severity !== severity) return false
    if (block !== 'all' && n.blockCode !== block) return false
    if (query) {
      const q = query.toLowerCase()
      if (!n.code.toLowerCase().includes(q) && !n.title.toLowerCase().includes(q) && !n.responsible.toLowerCase().includes(q))
        return false
    }
    return true
  })

  // mantém o drawer sincronizado com o estado global após uma ação
  const selectedLive = selected ? (nonConformities.find((n) => n.id === selected.id) ?? null) : null

  const counts = {
    all: nonConformities.length,
    open: nonConformities.filter((n) => n.status === 'open').length,
    in_progress: nonConformities.filter((n) => n.status === 'in_progress').length,
    verification: nonConformities.filter((n) => n.status === 'verification').length,
    resolved: nonConformities.filter((n) => n.status === 'resolved').length,
  }

  const summary = [
    { label: 'Abertas', value: counts.open, tone: 'text-status-critical' },
    { label: 'Em andamento', value: counts.in_progress, tone: 'text-status-warning' },
    { label: 'Em verificação', value: counts.verification, tone: 'text-status-info' },
    { label: 'Resolvidas', value: counts.resolved, tone: 'text-status-success' },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Qualidade e segurança · Registro formal"
        title="Não conformidades"
        description="Todo desvio confirmado vira um registro rastreável, com norma citada, responsável, prazo e evidência."
        meta={[
          { label: 'Total', value: String(counts.all).padStart(2, '0') },
          { label: 'Em aberto', value: String(counts.all - counts.resolved).padStart(2, '0') },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => push({ tone: 'info', title: 'Exportação gerada', description: 'Planilha das NCs filtradas pronta para download.' })}
          >
            <Download className="h-3.5 w-3.5" />
            Exportar
          </Button>
        }
      />

      <PageBody className="space-y-5">
        {/* resumo por status */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {summary.map((s) => (
            <div key={s.label} className="rounded-md border border-border bg-card px-4 py-3 shadow-panel">
              <p className="tech-label">{s.label}</p>
              <p className={cn('mt-1 font-display text-[26px] font-700 leading-none tabular-nums', s.tone)}>
                {String(s.value).padStart(2, '0')}
              </p>
            </div>
          ))}
        </div>

        {/* filtros */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <Tabs value={status} onValueChange={(v) => setStatus(v as NonConformityStatus | 'all')}>
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="open">Abertas</TabsTrigger>
              <TabsTrigger value="in_progress">Em andamento</TabsTrigger>
              <TabsTrigger value="verification">Verificação</TabsTrigger>
              <TabsTrigger value="resolved">Resolvidas</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-graphite-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="NC-00124, responsável…"
                className="h-9 w-[212px] rounded-[3px] border border-graphite-200 bg-white pl-8 pr-3 font-mono text-[12px] text-graphite-700 placeholder:text-graphite-400 focus:border-technical-400 focus:outline-none focus:ring-2 focus:ring-technical-400/20"
              />
            </div>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Severidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toda severidade</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
                <SelectItem value="warning">Média</SelectItem>
                <SelectItem value="info">Baixa</SelectItem>
              </SelectContent>
            </Select>
            <Select value={block} onValueChange={setBlock}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Bloco" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os blocos</SelectItem>
                {blocks.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
            <span className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-graphite-400">
              <Filter className="h-3.5 w-3.5" />
              {filtered.length} registro{filtered.length === 1 ? '' : 's'}
            </span>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-graphite-300">
              Clique numa linha para abrir a ficha
            </span>
          </div>
          <NCTable items={filtered} onSelect={setSelected} />
        </Card>
      </PageBody>

      <NCDetailDrawer nc={selectedLive} onClose={() => setSelected(null)} />
    </>
  )
}
