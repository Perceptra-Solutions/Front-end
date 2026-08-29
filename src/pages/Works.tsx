import * as React from 'react'
import { Camera, Layers, MapPin, Pencil, Plus, Siren, UserCog } from 'lucide-react'
import { PageBody, PageHeader } from '@/components/shared/PageHeader'
import { Carregando, ErroConexao, SemDadoNoBackend } from '@/components/shared/EstadoPagina'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ObraFormDialog } from '@/components/works/ObraFormDialog'
import { useRecurso } from '@/hooks/useRecurso'
import { listarCameras, listarLocais, listarObras, listarUsuarios } from '@/lib/api/cadastros'
import { garantirUsuario } from '@/lib/api/client'
import { useAppStore } from '@/store/AppStore'
import { listarNaoConformidades } from '@/lib/api/naoConformidades'
import type { ObraApi, StatusObra, UsuarioApi } from '@/lib/api/types'
import { formatDate } from '@/lib/utils'

const STATUS: Record<StatusObra, { rotulo: string; variant: 'info' | 'warning' | 'success' | 'default' }> = {
  PLANEJAMENTO: { rotulo: 'Planejamento', variant: 'default' },
  EM_ANDAMENTO: { rotulo: 'Em andamento', variant: 'info' },
  PARALISADA: { rotulo: 'Paralisada', variant: 'warning' },
  CONCLUIDA: { rotulo: 'Concluída', variant: 'success' },
}

const STATUS_ABERTOS = ['ABERTA', 'EM_CORRECAO', 'AGUARDANDO_VERIFICACAO']

export default function Works() {
  const { recarregarTudo } = useAppStore()
  const [formAberto, setFormAberto] = React.useState(false)
  const [emEdicao, setEmEdicao] = React.useState<ObraApi | null>(null)

  const { dados, carregando, erro, recarregar } = useRecurso(async (signal) => {
    // Uma leitura de cada agregado, depois tudo é contado por obra em memória:
    // é mais barato que N requisições por obra e mantém a tela consistente
    // (todos os números vêm do mesmo instante).
    const [obras, locais, cameras, usuarios, ncs, usuario] = await Promise.all([
      listarObras(signal),
      listarLocais({}, signal),
      listarCameras({}, signal),
      listarUsuarios({}, signal),
      listarNaoConformidades({ tamanho: 100 }, signal),
      garantirUsuario(),
    ])

    const nomePorUsuario = new Map(usuarios.itens.map((u) => [u.id, u]))

    const linhas = obras.itens.map((obra) => {
      const camerasDaObra = cameras.itens.filter((c) => c.obraId === obra.id)
      const ncsDaObra = ncs.itens.filter((nc) => nc.obraId === obra.id)
      const responsavel = obra.responsavelTecnicoId ? nomePorUsuario.get(obra.responsavelTecnicoId) : undefined

      return {
        obra,
        locais: locais.itens.filter((l) => l.obraId === obra.id).length,
        camerasTotal: camerasDaObra.length,
        camerasAtivas: camerasDaObra.filter((c) => c.status === 'ATIVA').length,
        ncsAbertas: ncsDaObra.filter((nc) => STATUS_ABERTOS.includes(nc.status)).length,
        ncsCriticas: ncsDaObra.filter((nc) => STATUS_ABERTOS.includes(nc.status) && nc.severidade === 'CRITICA').length,
        responsavel,
      }
    })

    return {
      linhas,
      ehGestor: usuario?.papel === 'GESTOR',
      engenheiros: usuarios.itens.filter((u) => u.papel === 'ENGENHEIRO' && u.ativo) as UsuarioApi[],
    }
  })

  const linhas = dados?.linhas ?? []
  const ehGestor = dados?.ehGestor ?? false
  const totalCameras = linhas.reduce((s, l) => s + l.camerasTotal, 0)

  const abrirNova = () => {
    setEmEdicao(null)
    setFormAberto(true)
  }
  const abrirEdicao = (obra: ObraApi) => {
    setEmEdicao(obra)
    setFormAberto(true)
  }

  return (
    <>
      <PageHeader
        eyebrow="Portfólio · Empreendimentos"
        title="Obras e locais"
        description="Empreendimentos monitorados pela plataforma, com parque de câmeras e não conformidades em aberto."
        meta={[
          { label: 'Obras', value: carregando ? '—' : String(linhas.length) },
          { label: 'Câmeras', value: carregando ? '—' : String(totalCameras) },
        ]}
        actions={
          ehGestor ? (
            <Button variant="navy" size="sm" onClick={abrirNova}>
              <Plus className="h-3.5 w-3.5" />
              Nova obra
            </Button>
          ) : undefined
        }
      />

      <PageBody className="space-y-5">
        {carregando && <Carregando texto="Carregando obras…" />}
        {erro && !carregando && <ErroConexao mensagem={erro} aoTentarNovamente={recarregar} />}
        {!carregando && !erro && linhas.length === 0 && (
          <div className="rounded-md border border-dashed border-graphite-200 bg-card px-6 py-16 text-center shadow-panel">
            <Layers className="mx-auto h-6 w-6 text-graphite-300" />
            <p className="mt-3 text-[14px] font-600 text-graphite-800">Nenhuma obra cadastrada</p>
            <p className="mx-auto mt-1 max-w-md text-[13px] text-graphite-500">
              {ehGestor
                ? 'A obra é a raiz de tudo: locais, câmeras, detecções e não conformidades pendem dela.'
                : 'Só o gestor pode cadastrar obras.'}
            </p>
            {ehGestor && (
              <Button variant="navy" size="sm" className="mt-5" onClick={abrirNova}>
                <Plus className="h-3.5 w-3.5" />
                Cadastrar primeira obra
              </Button>
            )}
          </div>
        )}

        {!carregando && !erro && linhas.length > 0 && (
          <>
            <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
              {linhas.map(({ obra, locais, camerasTotal, camerasAtivas, ncsAbertas, ncsCriticas, responsavel }) => {
                const st = STATUS[obra.status]
                return (
                  <Card key={obra.id}>
                    <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3.5">
                      <div className="min-w-0">
                        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-graphite-400">
                          {obra.codigo}
                        </p>
                        <h3 className="mt-0.5 truncate font-display text-[17.5px] font-600 uppercase tracking-[0.01em] text-navy-900">
                          {obra.nome}
                        </h3>
                        <p className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-graphite-500">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">
                            {[obra.cidade, obra.uf].filter(Boolean).join(' · ') || 'Localização não informada'}
                          </span>
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge variant={st.variant}>{st.rotulo}</Badge>
                        {ehGestor && (
                          <Button variant="ghost" size="icon-sm" onClick={() => abrirEdicao(obra)} title="Editar obra">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <p className="flex items-center gap-1 tech-label">
                            <Siren className="h-3 w-3" />
                            NCs abertas
                          </p>
                          <p className="mt-0.5 font-mono text-[15px] font-600 tabular-nums text-status-critical">
                            {String(ncsAbertas).padStart(2, '0')}
                          </p>
                          <p className="text-[11px] text-graphite-400">{ncsCriticas} crítica(s)</p>
                        </div>
                        <div>
                          <p className="flex items-center gap-1 tech-label">
                            <Camera className="h-3 w-3" />
                            Câmeras
                          </p>
                          <p className="mt-0.5 font-mono text-[15px] font-600 tabular-nums text-graphite-900">
                            {camerasAtivas}/{camerasTotal}
                          </p>
                          <p className="text-[11px] text-graphite-400">ativas</p>
                        </div>
                        <div>
                          <p className="flex items-center gap-1 tech-label">
                            <Layers className="h-3 w-3" />
                            Locais
                          </p>
                          <p className="mt-0.5 font-mono text-[15px] font-600 tabular-nums text-graphite-900">
                            {String(locais).padStart(2, '0')}
                          </p>
                          <p className="text-[11px] text-graphite-400">cadastrados</p>
                        </div>
                      </div>

                      <dl className="grid grid-cols-2 gap-3 border-t border-border pt-3">
                        {[
                          { label: 'Endereço', value: obra.endereco ?? '—' },
                          {
                            label: 'Resp. técnico',
                            value: responsavel?.nome ?? '—',
                            hint: responsavel?.crea ?? undefined,
                          },
                          { label: 'Início previsto', value: obra.inicioPrevisto ? formatDate(obra.inicioPrevisto) : '—' },
                          { label: 'Fim previsto', value: obra.fimPrevisto ? formatDate(obra.fimPrevisto) : '—' },
                        ].map((r) => (
                          <div key={r.label} className="min-w-0">
                            <dt className="tech-label">{r.label}</dt>
                            <dd className="mt-0.5 truncate text-[12.5px] text-graphite-700" title={r.value}>
                              {r.value}
                            </dd>
                            {r.hint && (
                              <dd className="flex items-center gap-1 font-mono text-[10.5px] text-graphite-400">
                                <UserCog className="h-2.5 w-2.5" />
                                {r.hint}
                              </dd>
                            )}
                          </div>
                        ))}
                      </dl>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/*
              A versão anterior mostrava avanço físico, índice de
              conformidade, área e coordenadas — nenhum existe no schema.
              Removidos em vez de estimados: numa tela de portfólio, um
              percentual inventado é indistinguível de uma medição.
            */}
            <SemDadoNoBackend>
              Saíram desta tela por não existirem no backend: <b>avanço físico</b>, <b>índice de conformidade da obra</b>,{' '}
              <b>área construída</b>, <b>blocos/pavimentos</b> e <b>coordenadas</b>. A tabela{' '}
              <code className="font-mono text-[11.5px]">obra</code> guarda código, nome, endereço, status, responsável
              técnico e período previsto — o resto seria estimativa.
            </SemDadoNoBackend>
          </>
        )}
      </PageBody>

      <ObraFormDialog
        aberto={formAberto}
        obra={emEdicao}
        engenheiros={dados?.engenheiros ?? []}
        aoFechar={() => setFormAberto(false)}
        aoSalvar={() => {
          recarregar()
          // A obra é o contexto de quase toda a aplicação (topbar, dashboard,
          // mapa, gêmeo digital). Cadastrar a primeira precisa refletir fora
          // desta tela, não só nela.
          recarregarTudo()
        }}
      />
    </>
  )
}
