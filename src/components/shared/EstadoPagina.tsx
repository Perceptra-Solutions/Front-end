import * as React from 'react'
import { AlertTriangle, Inbox, Loader2, RotateCw } from 'lucide-react'

import { Button } from '@/components/ui/button'

const MOLDURA = 'rounded-md border border-border bg-card px-4 py-10 text-center shadow-panel'

export function Carregando({ texto = 'Carregando…' }: { texto?: string }) {
  return (
    <div className={MOLDURA}>
      <Loader2 className="mx-auto h-5 w-5 animate-spin text-graphite-300" />
      <p className="mt-2 text-[13px] text-graphite-500">{texto}</p>
    </div>
  )
}

/**
 * Erro de conexão com o backend. Mostra a mensagem real da API (que já vem
 * com código e explicação úteis, ver `excecao-global.filter.ts`) em vez de um
 * "algo deu errado" — e oferece tentar de novo, porque o caso mais comum é a
 * API não ter subido ainda.
 */
export function ErroConexao({ mensagem, aoTentarNovamente }: { mensagem: string; aoTentarNovamente?: () => void }) {
  return (
    <div className={MOLDURA}>
      <AlertTriangle className="mx-auto h-5 w-5 text-status-warning" />
      <p className="mt-2 text-[13px] font-600 text-graphite-700">Não foi possível carregar os dados</p>
      <p className="mx-auto mt-1 max-w-xl text-[12.5px] text-graphite-500">{mensagem}</p>
      {aoTentarNovamente && (
        <Button variant="outline" size="sm" className="mt-4" onClick={aoTentarNovamente}>
          <RotateCw className="h-3.5 w-3.5" />
          Tentar novamente
        </Button>
      )}
    </div>
  )
}

export function Vazio({ titulo, descricao }: { titulo: string; descricao?: string }) {
  return (
    <div className="rounded-md border border-dashed border-graphite-200 bg-card px-4 py-10 text-center shadow-panel">
      <Inbox className="mx-auto h-5 w-5 text-graphite-300" />
      <p className="mt-2 text-[13px] font-600 text-graphite-700">{titulo}</p>
      {descricao && <p className="mx-auto mt-1 max-w-xl text-[12.5px] text-graphite-400">{descricao}</p>}
    </div>
  )
}

/**
 * Nota de campo sem contrapartida no backend.
 *
 * Preferimos dizer que o dado não existe a inventar um número plausível: numa
 * tela de gestão, um valor inventado é indistinguível de uma medição errada.
 */
export function SemDadoNoBackend({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-graphite-200 bg-graphite-50 px-4 py-2.5 text-[12px] text-graphite-500">
      {children}
    </p>
  )
}
