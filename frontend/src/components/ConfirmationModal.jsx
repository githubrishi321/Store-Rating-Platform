import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * ConfirmationModal component
 * A clean, accessible modal dialog for destructive or critical actions.
 */
const ConfirmationModal = ({
  isOpen,
  title,
  message,
  consequences,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const cancelRef = useRef(null);

  // Focus the cancel button when modal opens (safe default for destructive actions)
  useEffect(() => {
    if (isOpen && cancelRef.current) {
      setTimeout(() => cancelRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onCancel(); }}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
            <AlertTriangle size={18} className="text-red-600" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <h3 id="modal-title" className="text-base font-semibold text-slate-900 leading-tight">
              {title}
            </h3>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              {message}
            </p>
            {consequences && (
              <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700 leading-relaxed">
                {consequences}
              </div>
            )}
          </div>
          {!loading && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
              aria-label="Close"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100">
          <button
            ref={cancelRef}
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="btn-secondary text-sm"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="btn-danger text-sm"
          >
            {loading && <div className="spinner spinner-sm spinner-white" />}
            {loading ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
