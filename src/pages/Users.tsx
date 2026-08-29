import { PageBody, PageHeader } from '@/components/shared/PageHeader'
import { Carregando, ErroConexao, SemDadoNoBackend, Vazio } from '@/components/shared/EstadoPagina'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { useRecurso } from '@/hooks/useRecurso'
import { listarUsuarios } from '@/lib/api/cadastros'
import { listarNaoConformidades } from '@/lib/api/naoConformidades'
import type { PapelUsuario } from '@/lib/api/types'

const PAPEL: Record<PapelUsuario, { rotulo: string; descricao: string; variant: 'navy' | 'info' }> = {
  GESTOR: {
    rotulo: 'Gestor',
    descricao: 'Abre obra, cancela NC, emite relatório',
    variant: 'navy',
  },
  ENGENHEIRO: {
    rotulo: 'Engenheiro',
    descricao: 'Tria detecção, executa e verifica correção',
    variant: 'info',
  },
}

/** Mesmo padrão de `codigoDaAcao` em adapters.ts: o backend não tem coluna de código para usuário. */
const codigoDoUsuario = (id: string) => `USR-${id.slice(0, 8).toUpperCase()}`

const STATUS_ABERTOS = ['ABERTA', 'EM_CORRECAO', 'AGUARDANDO_VERIFICACAO']

export default function UsersPage() {
  /**
   * As NCs entram junto para calcular quantas estão sob responsabilidade de
   * cada um. É o único indicador desta tela que o backend permite derivar —
   * e é derivado de dado real, não estimado.
   */
  const { dados, carregando, erro, recarregar } = useRecurso(async (signal) => {
    const [usuarios, ncs] = await Promise.all([
      listarUsuarios({}, signal),
      listarNaoConformidades({ tamanho: 100 }, signal),
    ])

    const abertasPorResponsavel = new Map<string, number>()
    for (const nc of ncs.itens) {
      if (!nc.responsavelId || !STATUS_ABERTOS.includes(nc.status)) continue
      abertasPorResponsavel.set(nc.responsavelId, (abertasPorResponsavel.get(nc.responsavelId) ?? 0) + 1)
    }

    return { usuarios: usuarios.itens, abertasPorResponsavel }
  })

  const usuarios = dados?.usuarios ?? []
  const engenheiros = usuarios.filter((u) => u.papel === 'ENGENHEIRO').length

  return (
    <>
      <PageHeader
        eyebrow="Administração · Equipe"
        title="Usuários e papéis"
        description="Quem tria detecção, quem executa correção e quem verifica o fechamento — separação exigida pelo processo."
        meta={[
          { label: 'Usuários', value: carregando ? '—' : String(usuarios.length) },
          { label: 'Engenheiros', value: carregando ? '—' : String(engenheiros) },
        ]}
      />

      <PageBody className="space-y-5">
        {carregando && <Carregando texto="Carregando equipe…" />}
        {erro && !carregando && <ErroConexao mensagem={erro} aoTentarNovamente={recarregar} />}
        {!carregando && !erro && usuarios.length === 0 && (
          <Vazio titulo="Nenhum usuário cadastrado" descricao="Nenhum usuário ativo além do seu." />
        )}

        {!carregando && !erro && usuarios.length > 0 && (
          <>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[130px]">ID</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead className="w-[240px]">Papel</TableHead>
                    <TableHead className="w-[168px]">CREA</TableHead>
                    <TableHead className="w-[112px]">Situação</TableHead>
                    <TableHead className="w-[150px] text-right">NCs sob responsa.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((u) => {
                    const papel = PAPEL[u.papel]
                    const abertas = dados?.abertasPorResponsavel.get(u.id) ?? 0
                    return (
                      <TableRow key={u.id}>
                        <TableCell className="font-mono text-[12.5px] text-technical-700">
                          {codigoDoUsuario(u.id)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar name={u.nome} size="sm" tone="light" />
                            <div className="min-w-0">
                              <p className="truncate font-500 text-graphite-900">{u.nome}</p>
                              <p className="truncate font-mono text-[10.5px] text-graphite-400">{u.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={papel.variant}>{papel.rotulo}</Badge>
                          <p className="mt-1 text-[11.5px] text-graphite-400">{papel.descricao}</p>
                        </TableCell>
                        <TableCell className="font-mono text-[11.5px] text-graphite-600">{u.crea ?? '—'}</TableCell>
                        <TableCell>
                          <Badge variant={u.ativo ? 'success' : 'default'}>{u.ativo ? 'Ativo' : 'Inativo'}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-mono text-[13px] font-600 tabular-nums text-graphite-900">
                            {String(abertas).padStart(2, '0')}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Card>

            <div className="rounded-md border border-technical-300/60 bg-technical-100/50 px-4 py-3">
              <p className="font-display text-[13px] font-600 uppercase tracking-[0.12em] text-technical-700">
                Regra de segregação
              </p>
              <p className="mt-1 text-[13.5px] text-graphite-600">
                O engenheiro que verifica o fechamento de uma não conformidade não pode ser o mesmo que executou a ação
                corretiva. O sistema bloqueia essa combinação no momento da verificação, no domínio e no banco.
              </p>
            </div>

            {/*
              As colunas "Obras" e "Último acesso" existiam na versão anterior
              desta tela com dado fictício. Foram removidas em vez de
              preenchidas com "—": o backend não tem vínculo usuário↔obra
              (`usuario_obra` ficou fora do escopo) nem registro de acesso.
            */}
            <SemDadoNoBackend>
              Duas colunas saíram desta tela por não existirem no backend: <b>obras do usuário</b> (não há vínculo
              usuário↔obra — qualquer autenticado enxerga todas as obras) e <b>último acesso</b> (não há registro de
              sessão). O papel <b>AUDITOR</b>, que aparece no material de apresentação, também não existe:{' '}
              <code className="font-mono text-[11.5px]">papel_usuario</code> só tem GESTOR e ENGENHEIRO.
            </SemDadoNoBackend>
          </>
        )}
      </PageBody>
    </>
  )
}
