import type { InsightRange } from './insightsData';

interface InsightPeriodControlProps {
  value: InsightRange;
  rangeLabel: string;
  onChange: (range: InsightRange) => void;
}

export default function InsightPeriodControl({
  value,
  rangeLabel,
  onChange,
}: InsightPeriodControlProps) {
  return (
    <label className="insight-period-control">
      <span className="sr-only">Insights date range</span>
      <select
        aria-label="Insights date range"
        value={value}
        onChange={(event) => onChange(Number(event.target.value) as InsightRange)}
      >
        <option value={7}>Last 7 days</option>
        <option value={30}>Last 30 days</option>
        <option value={90}>Last 90 days</option>
      </select>
      <span>{rangeLabel}</span>
    </label>
  );
}
