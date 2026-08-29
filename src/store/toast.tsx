import * as React from 'react'
import { CheckCircle2, Info, X, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastTone = 'success' | 'info' | 'warning'

interface ToastItem {
  id: number
  title: string
  description?: string
  tone: ToastTone
}

interface ToastContextValue {
  push: (t: Omit<ToastItem, 'id'>) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([])
  const counter = React.useRef(0)

  const push = React.useCallback((t: Omit<ToastItem, 'id'>) => {
    const id = ++counter.current
    setItems((prev) => [...prev, { ...t, id }])
    window.setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), 5200)
  }, [])

  const dismiss = (id: number) => setItems((prev) => prev.filter((i) => i.id !== id))

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[70] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2">
        {items.map((item) => {
          const Icon = item.tone === 'success' ? CheckCircle2 : item.tone === 'warning' ? AlertTriangle : Info
          return (
            <div
              key={item.id}
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-[3px] border-l-[3px] border border-border bg-white p-3 shadow-raised animate-fade-up',
                item.tone === 'success' && 'border-l-status-success',
                item.tone === 'info' && 'border-l-technical-600',
                item.tone === 'warning' && 'border-l-status-warning',
              )}
            >
              <Icon
                className={cn(
                  'mt-0.5 h-4 w-4 shrink-0',
                  item.tone === 'success' && 'text-status-success',
                  item.tone === 'info' && 'text-technical-600',
                  item.tone === 'warning' && 'text-status-warning',
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="font-display text-[13px] font-600 uppercase tracking-[0.1em] text-graphite-900">{item.title}</p>
                {item.description && <p className="mt-0.5 text-[12.5px] leading-snug text-graphite-500">{item.description}</p>}
              </div>
              <button
                onClick={() => dismiss(item.id)}
                className="shrink-0 text-graphite-300 transition-colors hover:text-graphite-700"
                aria-label="Fechar aviso"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error('useToast precisa estar dentro de ToastProvider')
  return ctx
}
