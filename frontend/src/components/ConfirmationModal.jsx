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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
      <div
        className="bg-white rounded-xl border border-neutral-200 shadow-2xl max-w-md w-full p-6 transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 font-bold text-lg">
            ⚠️
          </div>
          <div className="flex-1 min-w-0">
            <h3 id="modal-title" className="text-lg font-bold text-neutral-900 leading-tight">
              {title}
            </h3>
            <p className="text-sm text-neutral-600 mt-2">
              {message}
            </p>
            {consequences && (
              <div className="mt-3 p-3 bg-red-50/70 border border-red-200 rounded-lg text-xs text-red-700 leading-relaxed">
                {consequences}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-neutral-100">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="btn-secondary text-sm py-2 px-4"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="btn-danger text-sm py-2 px-4 flex items-center gap-2"
          >
            {loading && (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {loading ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
