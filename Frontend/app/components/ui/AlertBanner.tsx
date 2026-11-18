interface AlertBannerProps {
  variant?: 'error' | 'success';
  title?: string;
  message: string;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function AlertBanner({
  variant = 'error',
  title,
  message,
  onDismiss,
  action,
}: AlertBannerProps) {
  const isError = variant === 'error';

  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-xs ${
        isError
          ? 'border-red-500/20 bg-red-500/10 text-red-700'
          : 'border-green-500/20 bg-green-500/10 text-green-700'
      }`}
    >
      <div className="min-w-0 space-y-0.5">
        {title && <p className="font-semibold">{title}</p>}
        <p>{message}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${
              isError
                ? 'border-red-300 bg-white text-red-700 hover:bg-red-50'
                : 'border-green-300 bg-white text-green-700 hover:bg-green-50'
            }`}
          >
            {action.label}
          </button>
        )}

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            className="font-mono text-sm leading-none hover:opacity-75"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
