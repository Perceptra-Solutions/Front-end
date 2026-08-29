import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, Menu, RefreshCw, Search } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { usuarioDemo } from '@/lib/api/client'
import { useAppStore } from '@/store/AppStore'
import { cn, formatTime, timeAgo } from '@/lib/utils'
import { SeverityBadge } from '@/components/shared/StatusBadge'

export function Topbar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const navigate = useNavigate()
  const { alerts, kpis, resetDemo, obraAtual, loading } = useAppStore()
  const [query, setQuery] = React.useState('')
  const [lastUpdate, setLastUpdate] = React.useState(() => new Date())

  const pending = alerts.filter((a) => a.status === 'pending').slice(0, 4)

  React.useEffect(() => {
    const id = window.setInterval(() => setLastUpdate(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    const q = query.trim().toUpperCase()
    if (q.startsWith('NC')) navigate('/non-conformities')
    else if (q.startsWith('CAM')) navigate('/cameras')
    else if (q.startsWith('PA')) navigate('/action-plans')
    else navigate('/alerts')
  }

  return (
    <header className="flex h-[68px] shrink-0 items-center gap-4 border-b border-border bg-white px-4 lg:px-6">
      <button
        onClick={onOpenMobileNav}
        className="flex h-9 w-9 items-center justify-center rounded-[3px] text-graphite-500 transition-colors hover:bg-graphite-100 lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* obra atual */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="hidden h-9 w-[3px] bg-technical-600 sm:block" />
        <div className="min-w-0">
          <p className="tech-label">Obra atual</p>
          <div className="flex items-center gap-2">
            <Link to="/works" className="truncate font-display text-[15.5px] font-600 uppercase tracking-[0.02em] text-navy-900 hover:text-technical-700">
              {obraAtual?.nome ?? (loading ? 'Carregando…' : 'Sem obra cadastrada')}
            </Link>
            <span className="hidden font-mono text-[10.5px] text-graphite-300 sm:inline">{obraAtual?.codigo ?? '—'}</span>
          </div>
        </div>
        <span className="ml-2 hidden items-center gap-1.5 rounded-[2px] border border-status-success/25 bg-status-success-bg px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-status-success md:inline-flex">
          <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-status-success" />
          Operação normal
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* busca */}
        <form onSubmit={onSubmitSearch} className="relative hidden xl:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-graphite-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar NC-00124, CAM-07, PV-04…"
            className="h-9 w-[268px] rounded-[3px] border border-graphite-200 bg-graphite-50 pl-8 pr-3 font-mono text-[12px] text-graphite-700 placeholder:text-graphite-400 focus:border-technical-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-technical-400/20"
          />
        </form>

        {/* última atualização */}
        <div className="hidden items-center gap-2 border-l border-border pl-3 lg:flex">
          <div className="text-right leading-tight">
            <p className="tech-label">Última atualização</p>
            <p className="font-mono text-[12.5px] tabular-nums text-graphite-700">{formatTime(lastUpdate.toISOString())}</p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  resetDemo()
                  setLastUpdate(new Date())
                }}
                aria-label="Recarregar dados da demonstração"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reiniciar demonstração</TooltipContent>
          </Tooltip>
        </div>

        {/* notificações */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative flex h-9 w-9 items-center justify-center rounded-[3px] text-graphite-500 transition-colors hover:bg-graphite-100 hover:text-graphite-900"
              aria-label="Notificações"
            >
              <Bell className="h-[18px] w-[18px]" />
              {kpis.activeAlerts > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-status-critical px-1 font-mono text-[9px] font-600 text-white">
                  {kpis.activeAlerts}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[340px] p-0">
            <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
              <span className="font-display text-[12px] font-600 uppercase tracking-[0.1em] text-graphite-700">Alertas ativos</span>
              <span className="font-mono text-[10.5px] text-graphite-400">{kpis.activeAlerts} pendentes</span>
            </div>
            <div className="max-h-[320px] overflow-y-auto">
              {pending.map((a) => (
                <button
                  key={a.id}
                  onClick={() => navigate(`/alerts/${a.id}`)}
                  className="flex w-full flex-col gap-1 border-b border-border px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-technical-100/50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <SeverityBadge severity={a.severity} />
                    <span className="font-mono text-[10px] text-graphite-400">{timeAgo(a.detectedAt, new Date('2026-08-28T17:42:00'))}</span>
                  </div>
                  <p className="text-[13px] font-500 text-graphite-900">{a.title}</p>
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-graphite-400">
                    {a.cameraCode} · {a.locationCode} · {a.confidence.toFixed(1)}%
                  </p>
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate('/alerts')}
              className="w-full border-t border-border px-3 py-2.5 text-center font-mono text-[10.5px] uppercase tracking-[0.14em] text-technical-600 transition-colors hover:bg-technical-100/60"
            >
              Abrir central de alertas
            </button>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* usuário */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn('flex items-center gap-2 rounded-[3px] px-1.5 py-1 transition-colors hover:bg-graphite-100')}>
              <Avatar name={usuarioDemo()?.nome ?? '—'} size="sm" />
              <div className="hidden text-left leading-tight md:block">
                <p className="text-[12.5px] font-500 text-graphite-900">{usuarioDemo()?.nome ?? 'Carregando…'}</p>
                <p className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-graphite-400">
                  {usuarioDemo()?.papel === 'GESTOR' ? 'Gestor' : 'Engenheiro responsável'}
                </p>
              </div>
              <ChevronDown className="hidden h-3.5 w-3.5 text-graphite-400 md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[220px]">
            <DropdownMenuLabel>{usuarioDemo()?.crea ?? usuarioDemo()?.email ?? '—'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>Perfil</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>Configurações</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/works')}>Trocar de obra</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
