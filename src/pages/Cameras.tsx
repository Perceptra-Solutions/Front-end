import * as React from 'react'
import { Link } from 'react-router-dom'
import { Settings2, Signal } from 'lucide-react'

import { PageBody, PageHeader } from '@/components/shared/PageHeader'
import { Carregando, ErroConexao, SemDadoNoBackend, Vazio } from '@/components/shared/EstadoPagina'
import { ProvisionarCameraDialog } from '@/components/cameras/ProvisionarCameraDialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusDot } from '@/components/shared/StatusBadge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRecurso } from '@/hooks/useRecurso'
import { garantirUsuario } from '@/lib/api/client'
import { listarCameras, listarLocais, listarModelosIa, listarObras } from '@/lib/api/cadastros'
import type { CameraApi, StatusCamera } from '@/lib/api/types'
import { formatDate, formatTime } from '@/lib/utils'

const TOM: Record<StatusCamera, 'online' | 'offline' | 'maintenance'> = {
  ATIVA: 'online',
  OFFLINE: 'offline',
  MANUTENCAO: 'maintenance',
}

export default function Cameras() {
  const [status, setStatus] = React.useState<StatusCamera | 'all'>('all')
  const [provisionando, setProvisionando] = React.useState<CameraApi | null>(null)

  const { dados, carregando, erro, recarregar } = useRecurso(async (signal) => {
    const [cameras, obras, locais, modelos, usuario] = await Promise.all([
      listarCameras({}, signal),
      listarObras(signal),
      listarLocais({}, signal),
      listarModelosIa(signal),
      garantirUsuario(),
    ])

    return {
      cameras: cameras.itens,
      obraPorId: new Map(obras.itens.map((o) => [o.id, o])),
      localPorId: new Map(locais.itens.map((l) => [l.id, l])),
      modeloPorId: new Map(modelos.itens.map((m) => [m.id, m])),
      ehGestor: usuario?.papel === 'GESTOR',
    }
  })

  const cameras = dados?.cameras ?? []
  const lista = cameras.filter((c) => status === 'all' || c.status === status)
  const ativas = cameras.filter((c) => c.status === 'ATIVA').length

  return (
    <>
      <PageHeader
        eyebrow="Infraestrutura · Parque de câmeras"
        title="Câmeras"
        description="Equipamentos instalados no canteiro, com o modelo de IA vinculado a cada ponto de captura."
        meta={[
          { label: 'Instaladas', value: carregando ? '—' : String(cameras.length) },
          { label: 'Ativas', value: carregando ? '—' : `${ativas} / ${cameras.length}` },
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
        {carregando && <Carregando texto="Carregando parque de câmeras…" />}
        {erro && !carregando && <ErroConexao mensagem={erro} aoTentarNovamente={recarregar} />}
        {!carregando && !erro && cameras.length === 0 && (
          <Vazio titulo="Nenhuma câmera cadastrada" descricao="Rode o seed do backend (npm run db:seed) para popular a demo." />
        )}

        {!carregando && !erro && cameras.length > 0 && (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <Select value={status} onValueChange={(v) => setStatus(v as StatusCamera | 'all')}>
                <SelectTrigger className="w-[190px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="ATIVA">Ativa</SelectItem>
                  <SelectItem value="MANUTENCAO">Em manutenção</SelectItem>
                  <SelectItem value="OFFLINE">Offline</SelectItem>
                </SelectContent>
              </Select>
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-graphite-400">
                {lista.length} equipamentos
              </span>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Identificador</TableHead>
                    <TableHead className="w-[180px]">Obra</TableHead>
                    <TableHead className="w-[200px]">Local</TableHead>
                    <TableHead className="w-[168px]">Equipamento</TableHead>
                    <TableHead className="w-[180px]">Modelo de IA</TableHead>
                    <TableHead className="w-[136px]">Status</TableHead>
                    <TableHead className="w-[150px]">Último heartbeat</TableHead>
                    {dados?.ehGestor && <TableHead className="w-[124px] text-right">Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lista.map((c) => {
                    const obra = dados?.obraPorId.get(c.obraId)
                    const local = c.localId ? dados?.localPorId.get(c.localId) : undefined
                    const modelo = c.modeloIaId ? dados?.modeloPorId.get(c.modeloIaId) : undefined
                    return (
                      <TableRow key={c.id}>
                        <TableCell>
                          <p className="font-mono text-[12.5px] font-600 text-technical-700">{c.identificador}</p>
                          <p className="font-mono text-[10.5px] text-graphite-400">{c.protocolo}</p>
                        </TableCell>
                        <TableCell className="text-[12.5px] text-graphite-600">{obra?.codigo ?? '—'}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-[12.5px] text-graphite-600" title={local?.nome}>
                          {local?.nome ?? 'Sem local vinculado'}
                        </TableCell>
                        <TableCell className="text-[12.5px] text-graphite-600">{c.fabricante ?? '—'}</TableCell>
                        <TableCell>
                          {modelo ? (
                            <>
                              <p className="text-[12.5px] text-graphite-700">{modelo.nome}</p>
                              <p className="font-mono text-[10.5px] text-graphite-400">v{modelo.versao}</p>
                            </>
                          ) : (
                            <span className="text-[12.5px] text-graphite-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusDot tone={TOM[c.status]} />
                        </TableCell>
                        <TableCell className="font-mono text-[11.5px] tabular-nums text-graphite-500">
                          {c.ultimoHeartbeat ? (
                            <>
                              {formatDate(c.ultimoHeartbeat)}{' '}
                              <span className="text-graphite-400">{formatTime(c.ultimoHeartbeat)}</span>
                            </>
                          ) : (
                            'nunca'
                          )}
                        </TableCell>
                        {dados?.ehGestor && (
                          <TableCell className="text-right">
                            <Button variant="outline" size="xs" onClick={() => setProvisionando(c)}>
                              <Settings2 className="h-3.5 w-3.5" />
                              Provisionar
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Card>

            {!dados?.ehGestor && (
              <SemDadoNoBackend>
                Emitir credencial e definir URL de stream exigem papel <b>GESTOR</b>. Entre como{' '}
                <code className="font-mono text-[11.5px]">gestora@perceptra.dev</code> (VITE_DEMO_EMAIL) para provisionar
                uma câmera.
              </SemDadoNoBackend>
            )}

            <SemDadoNoBackend>
              O backend <b>não expõe rota para listar credenciais</b> de uma câmera (só emitir e revogar), então esta tela
              mostra apenas a credencial emitida na sessão atual. Também não há como saber se uma câmera já tem URL de
              stream: a API nunca devolve a URL, nem cifrada. Saíram da tela por não existirem no schema: IP, resolução,
              FPS e uptime.
            </SemDadoNoBackend>
          </>
        )}
      </PageBody>

      <ProvisionarCameraDialog camera={provisionando} aoFechar={() => setProvisionando(null)} />
    </>
  )
}
