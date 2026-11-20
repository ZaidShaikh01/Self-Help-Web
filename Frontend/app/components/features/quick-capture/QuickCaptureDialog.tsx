import { BookOpen, Check, FileText, X, type LucideIcon } from 'lucide-react';
import ModalLayer from '~/components/common/ModalLayer';

export type QuickCaptureKind = 'journal' | 'habit' | 'resource';

interface QuickCaptureDialogProps {
  onClose: () => void;
  onSelect: (kind: QuickCaptureKind) => void;
}

const OPTIONS: {
  kind: QuickCaptureKind;
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    kind: 'journal',
    title: 'Journal entry',
    description: 'Capture a thought, daily reflection, or weekly review.',
    icon: FileText,
  },
  {
    kind: 'habit',
    title: 'Habit',
    description: 'Create a practice and start tracking your progress.',
    icon: Check,
  },
  {
    kind: 'resource',
    title: 'Library resource',
    description: 'Save a book, article, video, or documentary.',
    icon: BookOpen,
  },
];

export default function QuickCaptureDialog({
  onClose,
  onSelect,
}: QuickCaptureDialogProps) {
  return (
    <ModalLayer
      onClose={onClose}
      className="fixed inset-0 z-[12000] grid place-items-center overflow-y-auto bg-black/45 p-4 backdrop-blur-sm"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-capture-title"
        className="route-enter w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] px-5 py-5 sm:px-6">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Quick capture
            </p>
            <h2 id="quick-capture-title" className="mt-1 text-xl font-semibold">
              What would you like to add?
            </h2>
            <p className="mt-1 text-xs text-[var(--text-3)]">
              Choose a place for this thought or resource.
            </p>
          </div>
          <button
            type="button"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--border)] text-[var(--text-2)] transition-colors hover:bg-[var(--canvas-2)]"
            onClick={onClose}
            aria-label="Close quick capture"
          >
            <X size={16} />
          </button>
        </header>

        <div className="space-y-2 p-4 sm:p-5">
          {OPTIONS.map(({ kind, title, description, icon: OptionIcon }) => (
            <button
              key={kind}
              type="button"
              onClick={() => onSelect(kind)}
              className="group flex w-full items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--canvas-2)] sm:p-4"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-text)] transition-transform group-hover:scale-105">
                <OptionIcon size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{title}</span>
                <span className="mt-0.5 block text-xs text-[var(--text-3)]">
                  {description}
                </span>
              </span>
              <span className="text-[var(--text-3)] transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </button>
          ))}
        </div>
      </section>
    </ModalLayer>
  );
}
