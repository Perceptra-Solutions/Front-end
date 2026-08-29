import * as React from 'react'
import { Download, ImageOff, Loader2, Maximize2, Upload } from 'lucide-react'

import { PageBody, PageHeader } from '@/components/shared/PageHeader'
import { Carregando, ErroConexao } from '@/components/shared/EstadoPagina'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { apiBlobUrl } from '@/lib/api/client'
import { MIMES_PLANTA, buscarPlanta, caminhoArquivoPlanta, enviarPlanta } from '@/lib/api/plantaObra'
import type { PlantaObraApi } from '@/lib/api/types'
import { mensagemErro, useRecurso } from '@/hooks/useRecurso'
import { useAppStore } from '@/store/AppStore'
import { useToast } from '@/store/toast'

function tamanhoLegivel(bytes: string | null): string {
  if (!bytes) return '—'
  const n = Number(bytes)
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
}

/**
 * Mapa da Obra.
 *
 * A versão anterior desenhava uma planta em SVG com setores, câmeras e cotas
 * inventados — nada daquilo existia no banco. Aqui o mapa é o **arquivo real
 * que o usuário sobe**, guardado no servidor (`POST /obras/:id/planta`) e
 * lido de volta (`GET /obras/:id/planta/arquivo`).
 *
 * A tela prioriza o próprio arquivo: metadado e ação de substituir ficam
 * numa faixa discreta embaixo.
 */
export default function ConstructionMap() {
  const { obraAtual, usuario, loading: carregandoObra } = useAppStore()
  const { push } = useToast()

  const [planta, setPlanta] = React.useState<PlantaObraApi | null>(null)
  const [enviando, setEnviando] = React.useState(false)
  const [ampliado, setAmpliado] = React.useState(false)
  const entrada = React.useRef<HTMLInputElement>(null)

  const obraId = obraAtual?.id
  const ehGestor = usuario?.papel === 'GESTOR'

  // `obraId` como chave: ele chega depois da montagem (o AppStore carrega a
  // obra em paralelo), e sem isso a busca resolveria null e nunca repetiria.
  const { dados, carregando, erro, recarregar } = useRecurso(async (signal) => {
    if (!obraId) return null
    return buscarPlanta(obraId, signal)
  }, obraId ?? null)

  React.useEffect(() => {
    if (dados) setPlanta(dados)
  }, [dados])

  async function aoEscolherArquivo(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0]
    // Limpa antes de sair: sem isto, escolher o MESMO arquivo de novo não
    // dispara change e a substituição parece não funcionar.
    evento.target.value = ''
    if (!arquivo || !obraId) return

    if (!MIMES_PLANTA.includes(arquivo.type as (typeof MIMES_PLANTA)[number])) {
      push({
        tone: 'warning',
        title: 'Formato não aceito',
        description: 'Use PNG, JPEG, WebP, SVG ou PDF.',
      })
      return
    }

    setEnviando(true)
    try {
      setPlanta(await enviarPlanta(obraId, arquivo))
      push({ tone: 'success', title: 'Mapa da obra atualizado' })
    } catch (causa) {
      push({ tone: 'warning', title: 'Não foi possível enviar o mapa', description: mensagemErro(causa) })
    } finally {
      setEnviando(false)
    }
  }

  const temPlanta = planta?.existe === true

  return (
    <>
      <PageHeader
        eyebrow="Implantação"
        title="Mapa da obra"
        description="Planta, croqui ou implantação do canteiro — o arquivo fica guardado no servidor."
        meta={obraAtual ? [{ label: 'Obra', value: obraAtual.codigo }] : undefined}
        actions={
          ehGestor && temPlanta ? (
            <Button variant="outline" size="sm" onClick={() => entrada.current?.click()} disabled={enviando}>
              {enviando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              Substituir
            </Button>
          ) : undefined
        }
      />

      <input
        ref={entrada}
        type="file"
        accept={MIMES_PLANTA.join(',')}
        className="hidden"
        onChange={(e) => void aoEscolherArquivo(e)}
      />

      <PageBody>
        {(carregando || carregandoObra) && <Carregando texto="Carregando mapa da obra…" />}
        {erro && !carregando && <ErroConexao mensagem={erro} aoTentarNovamente={recarregar} />}

        {!carregando && !carregandoObra && !erro && !obraId && (
          <VazioSimples titulo="Nenhuma obra cadastrada" descricao="Cadastre uma obra antes de enviar o mapa." />
        )}

        {!carregando && !carregandoObra && !erro && obraId && !temPlanta && (
          <VazioSimples
            titulo="Nenhum mapa cadastrado"
            descricao={
              ehGestor
                ? 'Envie a planta ou o croqui do canteiro. Aceita PNG, JPEG, WebP, SVG ou PDF.'
                : 'Só o gestor pode enviar o mapa da obra.'
            }
            acao={
              ehGestor ? (
                <Button variant="navy" size="sm" onClick={() => entrada.current?.click()} disabled={enviando}>
                  {enviando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  Adicionar mapa da obra
                </Button>
              ) : undefined
            }
          />
        )}

        {!carregando && !erro && obraId && temPlanta && planta && (
          <figure className="overflow-hidden rounded-md border border-border bg-card shadow-panel">
            <VisualizadorPlanta
              obraId={obraId}
              planta={planta}
              onAmpliar={() => setAmpliado(true)}
              enviando={enviando}
            />
            {/* Metadado deliberadamente discreto: o arquivo é o conteúdo. */}
            <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border px-4 py-2.5 text-[11.5px] text-graphite-400">
              <span className="truncate font-500 text-graphite-600">{planta.nome ?? 'planta'}</span>
              <span>{tamanhoLegivel(planta.tamanhoBytes)}</span>
              {planta.atualizadaEm && (
                <span>atualizado em {new Date(planta.atualizadaEm).toLocaleDateString('pt-BR')}</span>
              )}
              <span className="ml-auto font-mono" title={planta.hashSha256 ?? undefined}>
                {planta.hashSha256?.slice(0, 12)}…
              </span>
            </figcaption>
          </figure>
        )}
      </PageBody>

      {planta && obraId && (
        <Dialog open={ampliado} onOpenChange={setAmpliado}>
          <DialogContent className="max-w-[min(96vw,1400px)] p-0">
            <VisualizadorPlanta obraId={obraId} planta={planta} ampliado />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

function VazioSimples({
  titulo,
  descricao,
  acao,
}: {
  titulo: string
  descricao: string
  acao?: React.ReactNode
}) {
  return (
    <div className="rounded-md border border-dashed border-graphite-200 bg-card px-6 py-16 text-center shadow-panel">
      <ImageOff className="mx-auto h-6 w-6 text-graphite-300" />
      <p className="mt-3 text-[14px] font-600 text-graphite-800">{titulo}</p>
      <p className="mx-auto mt-1 max-w-md text-[13px] text-graphite-500">{descricao}</p>
      {acao && <div className="mt-5">{acao}</div>}
    </div>
  )
}

/**
 * Busca o arquivo autenticado e o exibe. PDF vai em `<object>`, imagem em
 * `<img>` — a rota exige Bearer, então nenhum dos dois pode apontar direto
 * para a URL: o blob é buscado e vira object URL, revogado no cleanup.
 */
function VisualizadorPlanta({
  obraId,
  planta,
  ampliado,
  onAmpliar,
  enviando,
}: {
  obraId: string
  planta: PlantaObraApi
  ampliado?: boolean
  onAmpliar?: () => void
  enviando?: boolean
}) {
  const [url, setUrl] = React.useState<string | null>(null)
  const [falhou, setFalhou] = React.useState(false)

  // O hash entra nas dependências: substituir a planta troca o hash e força
  // a rebusca — sem isso o navegador continuaria mostrando a anterior.
  const chave = planta.hashSha256

  React.useEffect(() => {
    let cancelado = false
    let criada: string | null = null
    setUrl(null)
    setFalhou(false)

    apiBlobUrl(caminhoArquivoPlanta(obraId))
      .then((u) => {
        if (cancelado) {
          URL.revokeObjectURL(u)
          return
        }
        criada = u
        setUrl(u)
      })
      .catch(() => {
        if (!cancelado) setFalhou(true)
      })

    return () => {
      cancelado = true
      if (criada) URL.revokeObjectURL(criada)
    }
  }, [obraId, chave])

  const altura = ampliado ? 'h-[85vh]' : 'h-[clamp(340px,58vh,680px)]'

  if (falhou) {
    return (
      <div className={`flex ${altura} items-center justify-center text-[13px] text-graphite-400`}>
        Não foi possível carregar o arquivo do mapa.
      </div>
    )
  }

  if (!url) {
    return (
      <div className={`flex ${altura} items-center justify-center`}>
        <Loader2 className="h-5 w-5 animate-spin text-graphite-300" />
      </div>
    )
  }

  const ehPdf = planta.mime === 'application/pdf'

  return (
    <div className={`relative ${altura} bg-graphite-50`}>
      {ehPdf ? (
        <object data={url} type="application/pdf" className="h-full w-full">
          <div className="flex h-full items-center justify-center gap-2 text-[13px] text-graphite-500">
            Seu navegador não exibe PDF embutido.
            <a href={url} download={planta.nome ?? 'planta.pdf'} className="text-technical-600 underline">
              Baixar
            </a>
          </div>
        </object>
      ) : (
        <img src={url} alt={`Mapa da obra — ${planta.nome ?? ''}`} className="h-full w-full object-contain" />
      )}

      {enviando && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60">
          <Loader2 className="h-6 w-6 animate-spin text-technical-600" />
        </div>
      )}

      {!ampliado && (
        <div className="absolute right-3 top-3 flex gap-1.5">
          <Button variant="outline" size="icon-sm" asChild title="Baixar">
            <a href={url} download={planta.nome ?? 'planta'}>
              <Download className="h-3.5 w-3.5" />
            </a>
          </Button>
          {onAmpliar && (
            <Button variant="outline" size="icon-sm" onClick={onAmpliar} title="Ampliar">
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
