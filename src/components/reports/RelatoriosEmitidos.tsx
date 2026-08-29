import * as React from 'react'
import { CheckCircle2, Download, FileText, Loader2, ShieldCheck, ShieldX } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ApiError, ApiIndisponivelError, apiBlobUrl } from '@/lib/api/client'
import { caminhoArquivoRelatorio, verificarIntegridadeRelatorio } from '@/lib/api/relatorios'
import type { RelatorioApi } from '@/lib/api/types'
import { useToast } from '@/store/toast'

const ROTULO_TIPO: Record<RelatorioApi['tipo'], string> = {
  NAO_CONFORMIDADE: 'Não conformidades',
  PERIODICO: 'Periódico',
  OBRA: 'Obra',
}

function mensagemErro(erro: unknown): string {
  if (erro instanceof ApiIndisponivelError || erro instanceof ApiError) return erro.message
  return erro instanceof Error ? erro.message : 'Erro inesperado.'
}

function dataHora(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

/** Estado por linha: qual relatório está baixando / conferindo, e o veredito da conferência. */
type Veredito = { integra: boolean; hash: string }

interface RelatoriosEmitidosProps {
  relatorios: RelatorioApi[]
  carregando: boolean
  nomeObra: (obraId: string) => string
}

export function RelatoriosEmitidos({ relatorios, carregando, nomeObra }: RelatoriosEmitidosProps) {
  const { push } = useToast()
  const [baixando, setBaixando] = React.useState<string | null>(null)
  const [conferindo, setConferindo] = React.useState<string | null>(null)
  const [veredito, setVeredito] = React.useState<Record<string, Veredito>>({})

  /**
   * A rota do arquivo exige Bearer, então `<a href>` direto não funciona — a
   * tag não manda header. Busca o blob autenticado, dispara o download por um
   * link temporário e revoga o object URL logo depois (senão vaza memória a
   * cada download).
   */
  async function baixar(relatorio: RelatorioApi) {
    setBaixando(relatorio.id)
    try {
      const url = await apiBlobUrl(caminhoArquivoRelatorio(relatorio.id))
      const link = document.createElement('a')
      link.href = url
      link.download = `${relatorio.titulo.replace(/[^\w.-]+/g, '-')}.html`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (erro) {
      push({ tone: 'warning', title: 'Não foi possível baixar o relatório', description: mensagemErro(erro) })
    } finally {
      setBaixando(null)
    }
  }

  /**
   * O backend baixa o arquivo do storage de novo e recalcula o SHA-256 — não
   * confia no hash gravado no banco. É a prova de cadeia de custódia do
   * documento, e o que um auditor pede.
   */
  async function conferir(relatorio: RelatorioApi) {
    setConferindo(relatorio.id)
    try {
      const resultado = await verificarIntegridadeRelatorio(relatorio.id)
      setVeredito((prev) => ({
        ...prev,
        [relatorio.id]: { integra: resultado.integra, hash: resultado.hashRecalculado },
      }))
      push(
        resultado.integra
          ? {
              tone: 'success',
              title: 'Documento íntegro',
              description: `SHA-256 recalculado bate com o registrado: ${resultado.hashRecalculado.slice(0, 16)}…`,
            }
          : {
              tone: 'warning',
              title: 'Documento adulterado',
              description: 'O hash recalculado difere do registrado — o arquivo mudou desde a emissão.',
            },
      )
    } catch (erro) {
      push({ tone: 'warning', title: 'Não foi possível conferir a integridade', description: mensagemErro(erro) })
    } finally {
      setConferindo(null)
    }
  }

  if (carregando) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-6 text-[13px] text-graphite-500 shadow-panel">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando relatórios emitidos…
      </div>
    )
  }

  if (relatorios.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-graphite-200 bg-card px-4 py-8 text-center shadow-panel">
        <FileText className="mx-auto h-6 w-6 text-graphite-300" />
        <p className="mt-2 text-[13px] font-600 text-graphite-700">Nenhum relatório emitido ainda</p>
        <p className="mt-1 text-[12.5px] text-graphite-400">
          Um relatório congela as não conformidades do recorte escolhido e guarda o hash do documento.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-card shadow-panel">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Obra</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Período</TableHead>
            <TableHead className="text-right">NCs</TableHead>
            <TableHead>Emitido em</TableHead>
            <TableHead>SHA-256</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {relatorios.map((r) => {
            const conferido = veredito[r.id]
            return (
              <TableRow key={r.id}>
                <TableCell className="max-w-[220px] truncate font-600 text-navy-900" title={r.titulo}>
                  {r.titulo}
                </TableCell>
                <TableCell className="text-graphite-600">{nomeObra(r.obraId)}</TableCell>
                <TableCell className="text-graphite-600">{ROTULO_TIPO[r.tipo]}</TableCell>
                <TableCell className="font-mono text-[11.5px] text-graphite-500">
                  {r.periodoInicio && r.periodoFim ? `${r.periodoInicio} → ${r.periodoFim}` : '—'}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums text-graphite-900">{r.totalItens}</TableCell>
                <TableCell className="font-mono text-[11.5px] text-graphite-500">{dataHora(r.geradoEm)}</TableCell>
                <TableCell>
                  <span
                    className="font-mono text-[11px] text-graphite-400"
                    title={r.hashSha256 ?? 'sem hash registrado'}
                  >
                    {r.hashSha256 ? `${r.hashSha256.slice(0, 12)}…` : '—'}
                  </span>
                  {conferido && (
                    <span
                      className={
                        conferido.integra
                          ? 'ml-2 inline-flex items-center gap-1 text-[11px] font-600 text-status-success'
                          : 'ml-2 inline-flex items-center gap-1 text-[11px] font-600 text-status-critical'
                      }
                    >
                      {conferido.integra ? <ShieldCheck className="h-3 w-3" /> : <ShieldX className="h-3 w-3" />}
                      {conferido.integra ? 'íntegro' : 'adulterado'}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => void conferir(r)}
                      disabled={conferindo === r.id || !r.hashSha256}
                      title="Recalcula o SHA-256 a partir do arquivo armazenado"
                    >
                      {conferindo === r.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      Conferir
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => void baixar(r)}
                      disabled={baixando === r.id}
                      title="Baixa o documento (HTML autocontido, imprime em PDF pelo navegador)"
                    >
                      {baixando === r.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      Baixar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
