import { PageBody, PageHeader } from '@/components/shared/PageHeader'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { users } from '@/data/users'
import { formatDate, formatTime } from '@/lib/utils'
import type { UserRole } from '@/types'

const roleMeta: Record<UserRole, { label: string; variant: 'navy' | 'info' | 'warning' | 'default' }> = {
  gestor: { label: 'Gestor', variant: 'navy' },
  engenheiro: { label: 'Engenheiro', variant: 'info' },
  executor: { label: 'Executor', variant: 'warning' },
  auditor: { label: 'Auditor', variant: 'default' },
}

export default function UsersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Administração · Equipe"
        title="Usuários e papéis"
        description="Quem tria detecção, quem executa correção e quem verifica o fechamento — separação exigida pelo processo."
        meta={[
          { label: 'Usuários', value: String(users.length) },
          { label: 'Engenheiros', value: String(users.filter((u) => u.role === 'engenheiro').length) },
        ]}
      />

      <PageBody className="space-y-5">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[92px]">ID</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead className="w-[172px]">Papel</TableHead>
                <TableHead className="w-[168px]">CREA</TableHead>
                <TableHead className="w-[210px]">Obras</TableHead>
                <TableHead className="w-[132px]">Ações abertas</TableHead>
                <TableHead className="w-[150px]">Último acesso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-mono text-[12.5px] text-technical-700">{u.code}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.name} size="sm" tone="light" />
                      <div className="min-w-0">
                        <p className="truncate font-500 text-graphite-900">{u.name}</p>
                        <p className="truncate font-mono text-[10.5px] text-graphite-400">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleMeta[u.role].variant}>{roleMeta[u.role].label}</Badge>
                    <p className="mt-1 text-[11.5px] text-graphite-400">{u.roleLabel}</p>
                  </TableCell>
                  <TableCell className="font-mono text-[11.5px] text-graphite-600">{u.crea ?? '—'}</TableCell>
                  <TableCell className="text-[12.5px] text-graphite-600">{u.works.join(' · ')}</TableCell>
                  <TableCell>
                    <span className="font-mono text-[13px] font-600 tabular-nums text-graphite-900">
                      {String(u.openActions).padStart(2, '0')}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-[11.5px] tabular-nums text-graphite-500">
                    {formatDate(u.lastAccess)} <span className="text-graphite-400">{formatTime(u.lastAccess)}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <div className="rounded-md border border-technical-300/60 bg-technical-100/50 px-4 py-3">
          <p className="font-display text-[13px] font-600 uppercase tracking-[0.12em] text-technical-700">Regra de segregação</p>
          <p className="mt-1 text-[13.5px] text-graphite-600">
            O engenheiro que verifica o fechamento de uma não conformidade não pode ser o mesmo que executou a ação corretiva. O
            sistema bloqueia essa combinação no momento da verificação.
          </p>
        </div>
      </PageBody>
    </>
  )
}
