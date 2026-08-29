import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-[3px] border border-border bg-white shadow-panel">
        <Compass className="h-6 w-6 text-graphite-300" />
      </span>
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-technical-600">Erro 404</p>
        <h1 className="mt-2 font-display text-[27px] font-700 uppercase tracking-[0em] text-navy-900">Prancha não encontrada</h1>
        <p className="mt-2 max-w-md text-[14px] text-graphite-500">
          O endereço acessado não corresponde a nenhuma tela do sistema. Volte ao painel da obra para continuar a operação.
        </p>
      </div>
      <Button asChild>
        <Link to="/dashboard">Voltar ao painel</Link>
      </Button>
    </div>
  )
}
