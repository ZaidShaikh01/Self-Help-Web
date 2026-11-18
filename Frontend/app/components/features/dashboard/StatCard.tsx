/**
 * StatCard – a single metric tile for the dashboard stats row.
 *
 * Renders an icon, a label, a prominent numeric/string value, and an optional
 * trend indicator (↑ / ↓).  Includes a shimmer skeleton for the loading state
 * and a subtle lift on hover via CSS transition.
 */
import { Icon, type IconName } from '~/components/ui/Icon';

export interface StatCardProps {
  /** Icon name from the global Icon set */
  icon: IconName | string;
  /** Short label below the value, e.g. "Habits Today" */
  label: string;
  /** Displayed metric value, e.g. 4 or "12 d" */
  value: string | number;
  /** Optional trend: positive shows green ↑, negative shows red ↓ */
  trend?: number;
  /** Human-readable trend description, e.g. "+2 from last week" */
  trendLabel?: string;
  /** CSS colour token for the icon badge, e.g. "var(--accent)" */
  accentColor?: string;
  /** When true renders a shimmer placeholder instead of real data */
  loading?: boolean;
}

/** Thin shimmer bar used in the skeleton state */
function Shimmer({ className = '' }: { className?: string }) {
  return (
    <span
      className={`block rounded animate-pulse ${className}`}
      style={{ background: 'var(--border)' }}
    />
  );
}

/**
 * A compact metric card with icon badge, value, label, and optional trend.
 */
export default function StatCard({
  icon,
  label,
  value,
  trend,
  trendLabel,
  accentColor = 'var(--accent)',
  loading = false,
}: StatCardProps) {
  const hasTrend = trend !== undefined;
  const trendUp = (trend ?? 0) >= 0;

  return (
    <article
      className="stat-card flex flex-col gap-3 rounded-xl p-5 cursor-default select-none"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLElement).style.boxShadow =
          '0 6px 20px var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {/* Icon badge */}
      <div
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0"
        style={{ background: `${accentColor}1A`, color: accentColor }}
        aria-hidden="true"
      >
        <Icon name={icon as IconName} size={18} />
      </div>

      {/* Value */}
      {loading ? (
        <Shimmer className="h-8 w-16 mt-1" />
      ) : (
        <p
          className="text-3xl font-bold leading-none tracking-tight"
          style={{ color: 'var(--text)' }}
        >
          {value}
        </p>
      )}

      {/* Label */}
      {loading ? (
        <Shimmer className="h-3 w-24" />
      ) : (
        <p className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>
          {label}
        </p>
      )}

      {/* Trend */}
      {hasTrend && !loading && (
        <p
          className="text-xs font-medium"
          style={{ color: trendUp ? '#22c55e' : '#ef4444' }}
          title={trendLabel}
        >
          {trendUp ? '↑' : '↓'} {Math.abs(trend!)}
          {trendLabel && (
            <span style={{ color: 'var(--text-3)' }}> {trendLabel}</span>
          )}
        </p>
      )}
    </article>
  );
}
