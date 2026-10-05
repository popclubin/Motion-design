import { CheckCircle2, XCircle } from 'lucide-react';
import { useToastStore } from '../../lib/toastStore';
import { cx } from '../../lib/utils';

export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => dismiss(toast.id)}
          className={cx(
            'flex items-center gap-2 rounded-md border px-3 py-2 text-left text-[13px] shadow-panel',
            toast.variant === 'success'
              ? 'border-accent/40 bg-panel text-text'
              : 'border-danger/40 bg-panel text-text',
          )}
        >
          {toast.variant === 'success' ? (
            <CheckCircle2 size={15} className="text-accent" />
          ) : (
            <XCircle size={15} className="text-danger" />
          )}
          {toast.message}
        </button>
      ))}
    </div>
  );
}
