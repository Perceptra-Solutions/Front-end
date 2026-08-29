import * as React from 'react'
import { Link } from 'react-router-dom'
import { Cpu, Signal } from 'lucide-react'
import { PageBody, PageHeader } from '@/components/shared/PageHeader'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatusDot } from '@/components/shared/StatusBadge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cameras } from '@/data/cameras'
import { formatDate, formatTime } from '@/lib/utils'

export default function Cameras() {
  const [status, setStatus] = React.useState('all')
  const list = cameras.filter((c) => status === 'all' || c.status === status)

  const online = cameras.filter((c) => c.status === 'online').length

  return (
    <>
      <PageHeader
        eyebrow="Infraestrutura · Parque de câmeras"
        title="Câmeras"
        description="Equipamentos instalados no canteiro, com o modelo de IA vinculado a cada ponto de captura."
        meta={[
          { label: 'Instaladas', value: String(cameras.length) },
          { label: 'Online', value: `${online} / ${cameras.length}` },
          { label: 'Rede', value: '10.42.7.0/24' },
        ]}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/monitoring">
              <Signal className="h-3.5 w-3.5" />
              Abrir mural
            </Link>
          </Button>
        }
      />

      <PageBody className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[190px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="maintenance">Em manutenção</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-graphite-400">{list.length} equipamentos</span>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[92px]">ID</TableHead>
                <TableHead>Ponto de captura</TableHead>
                <TableHead className="w-[132px]">Local</TableHead>
                <TableHead className="w-[168px]">Equipamento</TableHead>
                <TableHead className="w-[120px]">Modelo IA</TableHead>
                <TableHead className="w-[122px]">Última detecção</TableHead>
                <TableHead className="w-[78px]">Alertas</TableHead>
                <TableHead className="w-[126px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-[12.5px] font-500 text-technical-700">{c.code}</TableCell>
                  <TableCell>
                    <p className="font-500 text-graphite-900">{c.name}</p>
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-graphite-400">
                      {c.ip} · {c.protocol}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-[12px] text-graphite-600">{c.locationCode}</span>
                    <span className="ml-1.5 text-[12px] text-graphite-400">{c.blockCode}</span>
                  </TableCell>
                  <TableCell>
                    <p className="text-[12.5px] text-graphite-700">{c.model}</p>
                    <p className="font-mono text-[10.5px] text-graphite-400">
                      {c.resolution} · {c.fps} fps
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="navy">
                      <Cpu className="h-3 w-3" />
                      {c.aiModelCode.replace('IA-MODEL-', 'M')}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-[11.5px] tabular-nums text-graphite-600">
                    {formatDate(c.lastDetectionAt)}
                    <span className="ml-1 text-graphite-400">{formatTime(c.lastDetectionAt)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-[13px] font-600 tabular-nums text-graphite-900">
                      {String(c.alertsToday).padStart(2, '0')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusDot tone={c.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </PageBody>
    </>
  )
}
