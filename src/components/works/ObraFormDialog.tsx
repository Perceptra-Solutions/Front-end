import * as React from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { atualizarObra, criarObra, type CriarObraInput } from '@/lib/api/cadastros'
import type { ObraApi, StatusObra, UsuarioApi } from '@/lib/api/types'
import { mensagemErro } from '@/hooks/useRecurso'
import { useToast } from '@/store/toast'

const STATUS: { valor: StatusObra; rotulo: string }[] = [
  { valor: 'PLANEJAMENTO', rotulo: 'Planejamento' },
  { valor: 'EM_ANDAMENTO', rotulo: 'Em andamento' },
  { valor: 'PARALISADA', rotulo: 'Paralisada' },
  { valor: 'CONCLUIDA', rotulo: 'Concluída' },
]

const VAZIO: CriarObraInput = {
  codigo: '',
  nome: '',
  endereco: '',
  cidade: '',
  uf: '',
  status: 'EM_ANDAMENTO',
  responsavelTecnicoId: '',
  inicioPrevisto: '',
  fimPrevisto: '',
}

interface Props {
  aberto: boolean
  /** `null` = criar; uma obra = editar. */
  obra: ObraApi | null
  /** Engenheiros para o seletor de responsável técnico — só eles têm CREA. */
  engenheiros: UsuarioApi[]
  aoFechar: () => void
  aoSalvar: (obra: ObraApi) => void
}

/**
 * Cadastro e edição de obra.
 *
 * Só valida aqui o que é barato e óbvio (campos obrigatórios). As regras de
 * verdade — código único, UF com duas letras, fim ≥ início, responsável que
 * existe — moram no banco e voltam como 409/422 com mensagem própria; o
 * diálogo mostra essa mensagem em vez de duplicar a regra no front e
 * arriscar divergir dela.
 */
export function ObraFormDialog({ aberto, obra, engenheiros, aoFechar, aoSalvar }: Props) {
  const { push } = useToast()
  const [form, setForm] = React.useState<CriarObraInput>(VAZIO)
  const [salvando, setSalvando] = React.useState(false)

  const editando = obra !== null

  React.useEffect(() => {
    if (!aberto) return
    setForm(
      obra
        ? {
            codigo: obra.codigo,
            nome: obra.nome,
            endereco: obra.endereco ?? '',
            cidade: obra.cidade ?? '',
            uf: obra.uf ?? '',
            status: obra.status,
            responsavelTecnicoId: obra.responsavelTecnicoId ?? '',
            inicioPrevisto: obra.inicioPrevisto ?? '',
            fimPrevisto: obra.fimPrevisto ?? '',
          }
        : VAZIO,
    )
  }, [aberto, obra])

  const definir = <C extends keyof CriarObraInput>(campo: C, valor: CriarObraInput[C]) =>
    setForm((prev) => ({ ...prev, [campo]: valor }))

  const podeSalvar = form.codigo.trim().length >= 2 && form.nome.trim().length >= 3

  async function salvar() {
    setSalvando(true)
    try {
      // Campo vazio vira `undefined`, não string vazia: o backend trata
      // ausência como "não informado", e '' falharia em @IsUUID/@IsDateString.
      const limpo = (v?: string) => (v && v.trim() !== '' ? v.trim() : undefined)
      const payload: CriarObraInput = {
        codigo: form.codigo.trim(),
        nome: form.nome.trim(),
        endereco: limpo(form.endereco),
        cidade: limpo(form.cidade),
        uf: limpo(form.uf),
        status: form.status,
        responsavelTecnicoId: limpo(form.responsavelTecnicoId),
        inicioPrevisto: limpo(form.inicioPrevisto),
        fimPrevisto: limpo(form.fimPrevisto),
      }

      const salva = editando ? await atualizarObra(obra.id, payload) : await criarObra(payload)
      push({ tone: 'success', title: editando ? 'Obra atualizada' : `Obra ${salva.codigo} cadastrada` })
      aoSalvar(salva)
      aoFechar()
    } catch (causa) {
      push({
        tone: 'warning',
        title: editando ? 'Não foi possível atualizar' : 'Não foi possível cadastrar',
        description: mensagemErro(causa),
      })
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && aoFechar()}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{editando ? `Editar ${obra.codigo}` : 'Nova obra'}</DialogTitle>
          <DialogDescription>
            Código e nome são obrigatórios. O resto pode ser preenchido depois.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-[160px_minmax(0,1fr)] gap-3">
            <Campo rotulo="Código">
              <Input
                value={form.codigo}
                onChange={(e) => definir('codigo', e.target.value)}
                placeholder="OB-2026-001"
                autoFocus
              />
            </Campo>
            <Campo rotulo="Nome">
              <Input
                value={form.nome}
                onChange={(e) => definir('nome', e.target.value)}
                placeholder="Residencial Aurora"
              />
            </Campo>
          </div>

          <Campo rotulo="Endereço">
            <Input
              value={form.endereco}
              onChange={(e) => definir('endereco', e.target.value)}
              placeholder="Av. das Acácias, 1200"
            />
          </Campo>

          <div className="grid grid-cols-[minmax(0,1fr)_88px_minmax(0,1fr)] gap-3">
            <Campo rotulo="Cidade">
              <Input value={form.cidade} onChange={(e) => definir('cidade', e.target.value)} />
            </Campo>
            <Campo rotulo="UF">
              <Input
                value={form.uf}
                onChange={(e) => definir('uf', e.target.value.toUpperCase().slice(0, 2))}
                placeholder="MG"
                maxLength={2}
              />
            </Campo>
            <Campo rotulo="Status">
              <Select value={form.status} onValueChange={(v) => definir('status', v as StatusObra)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS.map((s) => (
                    <SelectItem key={s.valor} value={s.valor}>
                      {s.rotulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Campo>
          </div>

          <Campo rotulo="Responsável técnico">
            <Select
              value={form.responsavelTecnicoId || 'nenhum'}
              onValueChange={(v) => definir('responsavelTecnicoId', v === 'nenhum' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sem responsável definido" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhum">Sem responsável definido</SelectItem>
                {engenheiros.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.nome}
                    {e.crea ? ` · ${e.crea}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>

          <div className="grid grid-cols-2 gap-3">
            <Campo rotulo="Início previsto">
              <Input
                type="date"
                value={form.inicioPrevisto}
                onChange={(e) => definir('inicioPrevisto', e.target.value)}
              />
            </Campo>
            <Campo rotulo="Fim previsto">
              <Input
                type="date"
                value={form.fimPrevisto}
                onChange={(e) => definir('fimPrevisto', e.target.value)}
              />
            </Campo>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={aoFechar} disabled={salvando}>
            Cancelar
          </Button>
          <Button variant="navy" size="sm" onClick={() => void salvar()} disabled={!podeSalvar || salvando}>
            {salvando && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {editando ? 'Salvar' : 'Cadastrar obra'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Campo({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="tech-label">{rotulo}</span>
      {children}
    </label>
  )
}
