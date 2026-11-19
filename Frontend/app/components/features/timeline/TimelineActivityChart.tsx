import { useMemo } from 'react';
import { createActivitySeries } from './timelineData';
import type { TimelineEvent } from './types';

interface TimelineActivityChartProps {
  events: TimelineEvent[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const CHART = {
  left: 22,
  right: 738,
  top: 28,
  bottom: 188,
};

function createWavePath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = points[index - 1];
    const distance = point.x - previous.x;
    return `${path} C ${previous.x + distance / 3} ${previous.y}, ${point.x - distance / 3} ${point.y}, ${point.x} ${point.y}`;
  }, '');
}

export default function TimelineActivityChart({
  events,
  selectedDate,
  onSelectDate,
}: TimelineActivityChartProps) {
  const series = useMemo(() => createActivitySeries(events), [events]);
  const peak = Math.max(1, ...series.map((point) => point.count));
  const points = series.map((point, index) => ({
    ...point,
    x:
      CHART.left +
      (index / Math.max(1, series.length - 1)) * (CHART.right - CHART.left),
    y:
      CHART.bottom -
      (point.count / peak) * (CHART.bottom - CHART.top),
  }));
  const wave = createWavePath(points);
  const area = `${wave} L ${CHART.right} ${CHART.bottom + 14} L ${CHART.left} ${CHART.bottom + 14} Z`;
  const total = series.reduce((sum, point) => sum + point.count, 0);

  return (
    <div className="timeline-chart-wrap">
      <div className="timeline-chart-summary">
        <span>ACTIVITY / LAST 7 DAYS</span>
        <strong>{total} events</strong>
      </div>
      <svg
        className="timeline-chart"
        viewBox="0 0 760 230"
        role="img"
        aria-label={`Activity graph for the last seven days, showing ${total} events. Select a day to filter the timeline.`}
      >
        <defs>
          <pattern
            id="timeline-grid"
            width="36"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 36 0 L 0 0 0 32"
              fill="none"
              stroke="var(--border-subtle)"
              strokeWidth="0.7"
            />
          </pattern>
          <linearGradient id="timeline-wave-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.24" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="timeline-wave-stroke" x1="0" x2="1">
            <stop offset="0%" stopColor="var(--text-3)" stopOpacity="0.55" />
            <stop offset="70%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
        </defs>
        <rect
          x="0"
          y="0"
          width="760"
          height="220"
          fill="url(#timeline-grid)"
        />
        {[68, 128, 188].map((y) => (
          <line
            key={y}
            x1="0"
            x2="760"
            y1={y}
            y2={y}
            className="timeline-chart-guide"
          />
        ))}
        <path d={area} className="timeline-chart-area" />
        <path d={wave} className="timeline-chart-wave" />
        {points.map((point, index) => (
          <g
            key={point.date}
            className={`timeline-chart-point ${
              point.date === selectedDate ? 'is-selected' : ''
            }`}
            role="button"
            tabIndex={0}
            aria-label={`${point.weekday}, ${point.day}: ${point.count} ${
              point.count === 1 ? 'event' : 'events'
            }. ${point.date === selectedDate ? 'Selected.' : 'Select day.'}`}
            onClick={() => onSelectDate(point.date)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelectDate(point.date);
              }
            }}
          >
            <circle cx={point.x} cy={point.y} r="15" className="timeline-chart-hit" />
            <circle
              cx={point.x}
              cy={point.y}
              r={point.count ? 5 : 3.5}
              className="timeline-chart-dot"
              style={{ animationDelay: `${index * 90}ms` }}
            />
            <text
              x={point.x}
              y={Math.max(18, point.y - 14)}
              className="timeline-chart-count"
              textAnchor="middle"
            >
              {point.count || ''}
            </text>
            <text
              x={point.x}
              y="216"
              className="timeline-chart-date"
              textAnchor="middle"
            >
              {point.weekday.toUpperCase()} {point.day}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
