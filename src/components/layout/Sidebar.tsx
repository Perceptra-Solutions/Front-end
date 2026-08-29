import { NavLink } from 'react-router-dom'
import { ChevronsLeft, ChevronsRight, HardHat } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from './Logo'
import { footerNav, navGroups, type NavItem } from './nav'
import { useAppStore } from '@/store/AppStore'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { currentUser } from '@/data/users'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  onNavigate?: () => void
}

function SidebarLink({ item, collapsed, count, onNavigate }: { item: NavItem; collapsed: boolean; count?: number; onNavigate?: () => void }) {
  const Icon = item.icon

  const link = (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-[3px] px-3 py-2 text-[13.5px] transition-colors',
          'text-navy-100/70 hover:bg-white/[0.06] hover:text-white',
          isActive && 'bg-technical-600/15 text-white',
          collapsed && 'justify-center px-0',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r bg-technical-400 transition-opacity',
              isActive ? 'opacity-100' : 'opacity-0',
            )}
          />
          <Icon className={cn('h-[17px] w-[17px] shrink-0', isActive ? 'text-technical-300' : 'text-navy-100/50')} />
          {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
          {!collapsed && count !== undefined && count > 0 && (
            <span
              className={cn(
                'rounded-[2px] px-1.5 py-[1px] font-mono text-[10px] tabular-nums',
                item.badgeKey === 'alerts' ? 'bg-status-critical text-white' : 'bg-white/10 text-white/80',
              )}
            >
              {count}
            </span>
          )}
        </>
      )}
    </NavLink>
  )

  if (!collapsed) return link

  return (
    <Tooltip delayDuration={120}>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">
        {item.label}
        {count ? ` · ${count}` : ''}
      </TooltipContent>
    </Tooltip>
  )
}

export function Sidebar({ collapsed, onToggle, onNavigate }: SidebarProps) {
  const { kpis, actionPlans } = useAppStore()

  const counts: Record<string, number> = {
    alerts: kpis.activeAlerts,
    nc: kpis.openNCs,
    plans: actionPlans.filter((p) => p.status !== 'done').length,
  }

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-navy-700/60 bg-navy-900 transition-[width] duration-200',
        collapsed ? 'w-[68px]' : 'w-[248px]',
      )}
    >
      {/* marca */}
      <div className={cn('flex h-[68px] shrink-0 items-center border-b border-navy-700/60 px-4', collapsed && 'justify-center px-0')}>
        <Logo collapsed={collapsed} />
      </div>

      {/* navegação */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 no-scrollbar">
        {navGroups.map((group, gi) => (
          <div key={group.title} className={cn(gi > 0 && 'mt-6')}>
            {!collapsed ? (
              <p className="mb-2 px-3 font-mono text-[9.5px] uppercase tracking-[0.22em] text-navy-100/35">{group.title}</p>
            ) : (
              <div className="mb-2 flex justify-center">
                <span className="h-px w-6 bg-white/10" />
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <SidebarLink
                  key={item.to}
                  item={item}
                  collapsed={collapsed}
                  count={item.badgeKey ? counts[item.badgeKey] : undefined}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* rodapé */}
      <div className="shrink-0 border-t border-navy-700/60 px-3 py-3">
        <div className="flex flex-col gap-0.5">
          {footerNav.map((item) => (
            <SidebarLink key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
          ))}
        </div>

        {!collapsed && (
          <div className="mt-3 flex items-center gap-2.5 rounded-[3px] bg-white/[0.04] px-3 py-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-[3px] bg-technical-600/20">
              <HardHat className="h-4 w-4 text-technical-300" />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[12.5px] font-500 text-white">{currentUser.name}</p>
              <p className="truncate font-mono text-[9.5px] uppercase tracking-[0.1em] text-navy-100/45">{currentUser.crea}</p>
            </div>
          </div>
        )}

        <button
          onClick={onToggle}
          className={cn(
            'mt-3 flex w-full items-center gap-2 rounded-[3px] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-navy-100/45 transition-colors hover:bg-white/[0.06] hover:text-white',
            collapsed && 'justify-center px-0',
          )}
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          {!collapsed && <span>Recolher</span>}
        </button>
      </div>
    </aside>
  )
}
