import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  toast: (opts: Omit<Toast, 'id'>) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const dismiss = useCallback((id: string) => {
    clearTimeout(timers.current[id])
    delete timers.current[id]
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    ({ type, title, message, duration = 5000 }: Omit<Toast, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`
      setToasts((prev) => [...prev.slice(-4), { id, type, title, message, duration }])
      timers.current[id] = setTimeout(() => dismiss(id), duration)
    },
    [dismiss]
  )

  const success = useCallback((title: string, message?: string) => toast({ type: 'success', title, message }), [toast])
  const error = useCallback((title: string, message?: string) => toast({ type: 'error', title, message, duration: 7000 }), [toast])
  const info = useCallback((title: string, message?: string) => toast({ type: 'info', title, message }), [toast])
  const warning = useCallback((title: string, message?: string) => toast({ type: 'warning', title, message }), [toast])

  return (
    <ToastContext.Provider value={{ toasts, toast, success, error, info, warning, dismiss }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
