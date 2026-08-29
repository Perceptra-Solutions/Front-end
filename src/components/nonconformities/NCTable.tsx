import { AlertOctagon, Bot, Hand } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SeverityBadge, NCStatusBadge } from '@/components/shared/StatusBadge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn, formatDate } from '@/lib/utils'
import type { NonConformity } from '@/types'

interface NCTableProps {
  items: NonConformity[]
  onSelect: (nc: NonConformity) => void
  compact?: boolean
}

const DEMO_TODAY = '2026-08-29'

export function NCTable({ items, onSelect, compact = false }: NCTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[104px]">ID</TableHead>
          <TableHead>Ocorrência</TableHead>
          <TableHead className="w-[150px]">Local</TableHead>
          <TableHead className="w-[126px]">Severidade</TableHead>
          {!compact && <TableHead className="w-[170px]">Responsável</TableHead>}
          <TableHead className="w-[118px]">Prazo</TableHead>
          <TableHead className="w-[150px]">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((nc) => {
          const overdue = nc.status !== 'resolved' && nc.deadline <= DEMO_TODAY
          return (
            <TableRow key={nc.id} onClick={() => onSelect(nc)} className="cursor-pointer">
              <TableCell className="font-mono text-[12.5px] font-500 text-technical-700">{nc.code}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="shrink-0 text-graphite-300">
                        {nc.origin === 'ai' ? <Bot className="h-3.5 w-3.5" /> : <Hand className="h-3.5 w-3.5" />}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>{nc.origin === 'ai' ? 'Detectada pela IA' : 'Registro manual'}</TooltipContent>
                  </Tooltip>
                  <div className="min-w-0">
                    <p className="truncate font-500 text-graphite-900">{nc.title}</p>
                    <p className="truncate font-mono text-[10.5px] uppercase tracking-[0.08em] text-graphite-400">
                      {nc.standardRef}
                      {nc.recurrenceOf && ` · reincidência de ${nc.recurrenceOf}`}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="font-mono text-[12px] text-graphite-600">{nc.locationCode}</span>
                <span className="ml-1.5 text-[12px] text-graphite-400">{nc.blockCode}</span>
              </TableCell>
              <TableCell>
                <SeverityBadge severity={nc.severity} />
              </TableCell>
              {!compact && <TableCell className="whitespace-nowrap">{nc.responsible}</TableCell>}
              <TableCell>
                <span className={cn('flex items-center gap-1.5 font-mono text-[12.5px] tabular-nums', overdue ? 'text-status-critical' : 'text-graphite-600')}>
                  {overdue && <AlertOctagon className="h-3.5 w-3.5" />}
                  {formatDate(nc.deadline)}
                </span>
              </TableCell>
              <TableCell>
                <NCStatusBadge status={nc.status} />
              </TableCell>
            </TableRow>
          )
        })}
        {items.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="py-10 text-center text-graphite-400">
              Nenhuma não conformidade com os filtros aplicados.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
