import * as React from 'react'
import { FileText, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ApiError, ApiIndisponivelError } from '@/lib/api/client'
import { gerarRelatorio } from '@/lib/api/relatorios'
import type { ObraApi, RelatorioApi, TipoRelatorio } from '@/lib/api/types'
import { useToast } from '@/store/toast'

const TIPOS: { valor: TipoRelatorio; rotulo: string; ajuda: string }[] = [
  {
    valor: 'OBRA',
    rotulo: 'Obra — tudo o que existe hoje',
    ajuda: 'Todas as não conformidades da obra, sem recorte de data.',
  },
  {
    valor: 'PERIODICO',
    rotulo: 'Periódico — recorte de datas',
    ajuda: 'Só as NCs abertas dentro do período. Exige início e fim.',
  },
  {
    valor: 'NAO_CONFORMIDADE',
    rotulo: 'Não conformidades — atestado',
    ajuda: 'Recusa gerar se nenhuma NC atende aos filtros: não há o que atestar.',
  },
]

function mensagemErro(erro: unknown): string {
  if (erro instanceof ApiIndisponivelError || erro instanceof ApiError) return erro.message
  return erro instanceof Error ? erro.message : 'Erro inesperado.'
}

interface EmitirRelatorioDialogProps {
  obras: ObraApi[]
  obraPadrao?: string
  /** `false` quando o usuário atual não é GESTOR — só o gestor assina o documento. */
  habilitado: boolean
  motivoDesabilitado?: string
  aoEmitir: (relatorio: RelatorioApi) => void
}

export function EmitirRelatorioDialog({
  obras,
  obraPadrao,
  habilitado,
  motivoDesabilitado,
  aoEmitir,
}: EmitirRelatorioDialogProps) {
  const { push } = useToast()
  const [aberto, setAberto] = React.useState(false)
  const [enviando, setEnviando] = React.useState(false)

  const [obraId, setObraId] = React.useState(obraPadrao ?? '')
  const [tipo, setTipo] = React.useState<TipoRelatorio>('OBRA')
  const [titulo, setTitulo] = React.useState('')
  const [periodoInicio, setPeriodoInicio] = React.useState('')
  const [periodoFim, setPeriodoFim] = React.useState('')

  React.useEffect(() => {
    if (obraPadrao && !obraId) setObraId(obraPadrao)
  }, [obraPadrao, obraId])

  const exigePeriodo = tipo === 'PERIODICO'
  const podeEnviar = obraId !== '' && (!exigePeriodo || (periodoInicio !== '' && periodoFim !== ''))

  async function emitir() {
    setEnviando(true)
    try {
      const relatorio = await gerarRelatorio({
        obraId,
        tipo,
        titulo: titulo.trim() || undefined,
        // O backend valida o par; mandar só um lado seria 422. Por isso os
        // dois só viajam juntos, e só quando o tipo pede período.
        ...(exigePeriodo || (periodoInicio && periodoFim) ? { periodoInicio, periodoFim } : {}),
      })

      push({
        tone: 'success',
        title: 'Relatório emitido',
        description: `${relatorio.totalItens} NC(s) congeladas · SHA-256 ${relatorio.hashSha256?.slice(0, 16)}…`,
      })
      aoEmitir(relatorio)
      setAberto(false)
      setTitulo('')
    } catch (erro) {
      // Erros de negócio do backend chegam com código próprio e mensagem
      // útil (RELATORIO_SEM_ITENS, PERIODO_INVERTIDO, 403 de papel...).
      // Mostrar a mensagem real vale mais que um texto genérico nosso.
      push({ tone: 'warning', title: 'Não foi possível emitir', description: mensagemErro(erro) })
    } finally {
      setEnviando(false)
    }
  }

  const botao = (
    <Button variant="navy" size="sm" disabled={!habilitado} title={habilitado ? undefined : motivoDesabilitado}>
      <FileText className="h-3.5 w-3.5" />
      Emitir relatório
    </Button>
  )

  // Sem permissão: o botão fica visível e desabilitado, com o motivo no
  // title — some da tela esconderia a funcionalidade em vez de explicá-la.
  if (!habilitado) return botao

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>{botao}</DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Emitir relatório</DialogTitle>
          <DialogDescription>
            As não conformidades que atendem aos filtros são congeladas no documento, na ordem em que aparecem
            nele. O arquivo é hasheado em SHA-256 — emitir de novo não altera um relatório já emitido.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="tech-label">Obra</label>
            <Select value={obraId} onValueChange={setObraId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a obra" />
              </SelectTrigger>
              <SelectContent>
                {obras.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.codigo} — {o.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="tech-label">Tipo</label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as TipoRelatorio)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS.map((t) => (
                  <SelectItem key={t.valor} value={t.valor}>
                    {t.rotulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[12px] text-graphite-400">{TIPOS.find((t) => t.valor === tipo)?.ajuda}</p>
          </div>

          {exigePeriodo && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="tech-label">Período — início</label>
                <Input type="date" value={periodoInicio} onChange={(e) => setPeriodoInicio(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="tech-label">Período — fim</label>
                <Input type="date" value={periodoFim} onChange={(e) => setPeriodoFim(e.target.value)} />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="tech-label">Título (opcional)</label>
            <Input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Em branco, o backend monta a partir da obra e do período"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => setAberto(false)} disabled={enviando}>
            Cancelar
          </Button>
          <Button variant="navy" size="sm" onClick={() => void emitir()} disabled={!podeEnviar || enviando}>
            {enviando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
            {enviando ? 'Emitindo…' : 'Emitir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
