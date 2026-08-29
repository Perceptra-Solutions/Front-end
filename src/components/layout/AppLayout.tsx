import * as React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

/**
 * Estrutura da central de operações: sidebar fixa, topbar com o contexto da obra
 * e a área de trabalho com a malha de planta ao fundo.
 */
export function AppLayout() {
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const location = useLocation()
  const mainRef = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    setMobileOpen(false)
    mainRef.current?.scrollTo({ top: 0 })
  }, [location.pathname])

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* sidebar desktop */}
      <div className="hidden lg:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      </div>

      {/* sidebar mobile como drawer */}
      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent
          hideClose
          className="left-0 top-0 h-full w-[248px] max-w-[80vw] translate-x-0 translate-y-0 rounded-none border-0 p-0 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left"
        >
          <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} onNavigate={() => setMobileOpen(false)} />
        </DialogContent>
      </Dialog>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMobileNav={() => setMobileOpen(true)} />
        <main ref={mainRef} className="relative flex-1 overflow-y-auto blueprint-grid">
          {/*
            O boundary fica AQUI, e não em volta de <Routes/>: assim um erro
            de render derruba só a área de conteúdo — sidebar e topbar
            continuam de pé e o usuário consegue navegar para outra tela em
            vez de ficar com a página em branco.
          */}
          <ErrorBoundary chaveReset={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
