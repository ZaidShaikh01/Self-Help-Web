import { useState } from 'react';
import { AlertTriangle, Archive, CheckCircle2 } from 'lucide-react';
import ModalLayer from './ModalLayer';

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel: string;
  tone?: 'danger' | 'default' | 'success';
  onClose: () => void;
  onConfirm: () => void | boolean | Promise<void | boolean>;
}

export default function ConfirmDialog({
  title,
  description,
  confirmLabel,
  tone = 'default',
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const ToneIcon =
    tone === 'danger'
      ? AlertTriangle
      : tone === 'success'
        ? Archive
        : CheckCircle2;

  async function handleConfirm() {
    setIsSubmitting(true);
    setError('');
    try {
      const succeeded = await onConfirm();
      if (succeeded === false) {
        setError('This action could not be completed. Please try again.');
        return;
      }
      onClose();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'This action could not be completed. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ModalLayer
      canDismiss={!isSubmitting}
      onClose={onClose}
      className="fixed inset-0 z-[11000] grid place-items-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm"
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 text-[var(--text)] shadow-2xl sm:p-6"
      >
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full ${
              tone === 'danger'
                ? 'bg-[var(--danger-soft)] text-[var(--danger-text)]'
                : tone === 'success'
                  ? 'bg-[var(--success-soft)] text-[var(--success-text)]'
                  : 'bg-[var(--accent-soft)] text-[var(--accent)]'
            }`}
          >
            <ToneIcon size={17} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2
              id="confirm-dialog-title"
              className="text-base font-semibold tracking-tight"
            >
              {title}
            </h2>
            <p
              id="confirm-dialog-description"
              className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[var(--text-2)]"
            >
              {description}
            </p>
          </div>
        </div>

        {error && (
          <p
            className="mt-4 rounded-lg border border-[var(--danger-border)] bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger-text)]"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-mono font-semibold uppercase tracking-wider text-[var(--text-2)] transition-colors hover:bg-[var(--canvas-2)] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            autoFocus
            disabled={isSubmitting}
            onClick={() => void handleConfirm()}
            className={`rounded-lg px-4 py-2 text-xs font-mono font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 ${
              tone === 'danger'
                ? 'bg-[var(--danger-fill)] text-[var(--on-danger)] hover:bg-[var(--danger-fill-hover)]'
                : tone === 'success'
                  ? 'bg-[var(--success-fill)] text-[var(--on-success)] hover:bg-[var(--success-fill-hover)]'
                  : 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]'
            }`}
          >
            {isSubmitting ? 'Working…' : confirmLabel}
          </button>
        </div>
      </section>
    </ModalLayer>
  );
}
