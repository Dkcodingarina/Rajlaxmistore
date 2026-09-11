import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts } = useStore();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-[9999] flex flex-col space-y-2 pointer-events-none items-center sm:items-end">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center space-x-2 py-2 px-3 rounded-lg shadow-lg border text-[11px] font-semibold transition-all duration-300 backdrop-blur-md max-w-xs sm:max-w-sm ${
            toast.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700 shadow-rose-950/30'
              : toast.type === 'warning'
              ? 'bg-amber-900 text-white border-amber-700 shadow-amber-950/30'
              : toast.type === 'info'
              ? 'bg-neutral-900 text-white border-neutral-700 shadow-neutral-950/30'
              : 'bg-emerald-900 text-white border-emerald-700 shadow-emerald-950/30'
          }`}
        >
          <div className="shrink-0">
            {toast.type === 'error' && <XCircle className="w-3.5 h-3.5 text-rose-300" />}
            {toast.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />}
            {toast.type === 'info' && <Info className="w-3.5 h-3.5 text-sky-300" />}
            {toast.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />}
          </div>
          <p className="text-[11px] font-medium text-white truncate">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}
