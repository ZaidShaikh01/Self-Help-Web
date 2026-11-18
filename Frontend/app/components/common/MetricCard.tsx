import type { ReactNode } from 'react';

interface MetricProgressCardProps {
  title?: string;
  current?: number;
  total?: number;
  description?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * MetricProgressCard - A reusable card component to display a progress ratio 
 * (e.g. 0/4), an animated progress bar, and an accompanying description.
 */
export default function MetricProgressCard({
  title = "TODAY'S RHYTHM",
  current = 0,
  total = 4,
  description = "No perfect day required. Your history is made one useful action at a time.",
  className = "",
  children,
}: MetricProgressCardProps) {
  const safeTotal = Math.max(0, total);
  const safeCurrent = Math.max(0, Math.min(current, safeTotal));
  const percentage = safeTotal > 0 ? (safeCurrent / safeTotal) * 100 : 0;

  return (
    <article className={`metric-progress-card ${className}`}>
      <h2 className="metric-progress-card__title">
        {title}
      </h2>

      <div className="metric-progress-card__value">
        {safeCurrent}
        <span>/{safeTotal}</span>
      </div>

      <div
        className="metric-progress-card__track"
        role="progressbar"
        aria-label={`${title} progress`}
        aria-valuemin={0}
        aria-valuemax={safeTotal}
        aria-valuenow={safeCurrent}
      >
        <div
          className="metric-progress-card__fill"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="metric-progress-card__description">{description}</p>
      {children}
    </article>
  );
}