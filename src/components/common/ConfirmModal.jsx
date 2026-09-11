import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, CheckCircle2, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Yes, Delete',
  cancelText = 'Cancel',
  confirmVariant = 'danger', // 'danger' | 'warning' | 'primary'
  onConfirm,
  onClose,
  isProcessing = false
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (confirmVariant) {
      case 'danger':
        return {
          icon: <Trash2 className="w-6 h-6 text-rose-600" />,
          iconBg: 'bg-rose-50 border-rose-200/80',
          btnBg: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500 text-white'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
          iconBg: 'bg-amber-50 border-amber-200/80',
          btnBg: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 text-white'
        };
      default:
        return {
          icon: <CheckCircle2 className="w-6 h-6 text-neutral-800" />,
          iconBg: 'bg-neutral-100 border-neutral-300',
          btnBg: 'bg-neutral-900 hover:bg-neutral-800 focus:ring-neutral-900 text-white'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      id="global-confirm-modal-backdrop"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) onClose();
      }}
    >
      <div
        id="global-confirm-modal-dialog"
        className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-neutral-200/80 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 relative"
      >
        {/* Close icon button */}
        <button
          id="confirm-modal-close-btn"
          type="button"
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Icon & Content */}
        <div className="flex items-start space-x-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${styles.iconBg}`}>
            {styles.icon}
          </div>
          <div className="space-y-1.5 pt-0.5 min-w-0 flex-1 pr-4">
            <h3 className="font-serif font-black text-lg text-neutral-900 leading-snug">
              {title}
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed break-words">
              {message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            id="confirm-modal-cancel-btn"
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-bold transition cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            id="confirm-modal-action-btn"
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-1.5 ${styles.btnBg}`}
          >
            {isProcessing ? (
              <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
