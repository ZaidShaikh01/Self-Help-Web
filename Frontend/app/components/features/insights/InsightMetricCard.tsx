import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';

interface InsightMetricCardProps {
  label: string;
  value: string;
  detail: string;
  comparison: string;
  href: string;
  index: number;
}

export default function InsightMetricCard({
  label,
  value,
  detail,
  comparison,
  href,
  index,
}: InsightMetricCardProps) {
  return (
    <Link
      to={href}
      className="insight-metric-card"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <span className="insight-metric-label">{label}</span>
      <strong className="insight-metric-value">{value}</strong>
      <span className="insight-metric-detail">{detail}</span>
      <span className="insight-metric-comparison">
        {comparison}
        <ArrowUpRight size={13} aria-hidden="true" />
      </span>
    </Link>
  );
}
