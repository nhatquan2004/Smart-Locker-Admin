import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'

export type TToastType = 'success' | 'error' | 'info' | 'warning'

export type TToastItem = {
  id: string
  type: TToastType
  message: string
  duration?: number
}

type TToastContextType = {
  toast: {
    success: (message: string, duration?: number) => void
    error: (message: string, duration?: number) => void
    info: (message: string, duration?: number) => void
    warning: (message: string, duration?: number) => void
  }
  removeToast: (id: string) => void
}

const ToastContext = createContext<TToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<TToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((type: TToastType, message: string, duration = 3500) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    setToasts((prev) => [...prev, { id, type, message, duration }])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [removeToast])

  const toast = {
    success: useCallback((message: string, duration?: number) => addToast('success', message, duration), [addToast]),
    error: useCallback((message: string, duration?: number) => addToast('error', message, duration), [addToast]),
    info: useCallback((message: string, duration?: number) => addToast('info', message, duration), [addToast]),
    warning: useCallback((message: string, duration?: number) => addToast('warning', message, duration), [addToast]),
  }

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      {/* Global Toast Container Floating Top-Right */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((item) => (
          <ToastCard key={item.id} item={item} onClose={() => removeToast(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastCard({ item, onClose }: { item: TToastItem; onClose: () => void }) {
  const config = {
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
      border: 'border-emerald-200 dark:border-emerald-800/80',
      bg: 'bg-white dark:bg-slate-900',
      indicator: 'bg-emerald-500',
    },
    error: {
      icon: <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />,
      border: 'border-red-200 dark:border-red-800/80',
      bg: 'bg-white dark:bg-slate-900',
      indicator: 'bg-red-500',
    },
    info: {
      icon: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
      border: 'border-sky-200 dark:border-sky-800/80',
      bg: 'bg-white dark:bg-slate-900',
      indicator: 'bg-sky-500',
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
      border: 'border-amber-200 dark:border-amber-800/80',
      bg: 'bg-white dark:bg-slate-900',
      indicator: 'bg-amber-500',
    },
  }[item.type]

  return (
    <div className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-lg ${config.bg} ${config.border} transition-all transform animate-slide-in-right relative overflow-hidden`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.indicator}`} />
      <div className="flex items-center gap-3 min-w-0 pl-1">
        {config.icon}
        <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 leading-snug break-words">
          {item.message}
        </span>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context.toast
}
