import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import type { Resource, ResourceStatus } from '~/lib/library';

interface ResourceStatusChartProps {
  resources: Resource[];
}

const STATUSES: Array<{
  value: ResourceStatus;
  label: string;
  className: string;
}> = [
  { value: 'In Progress', label: 'In progress', className: 'in-progress' },
  { value: 'Plan to Do', label: 'Planned', className: 'planned' },
  { value: 'Completed', label: 'Completed', className: 'completed' },
];

const CIRCUMFERENCE = 2 * Math.PI * 45;

export default function ResourceStatusChart({
  resources,
}: ResourceStatusChartProps) {
  const counts = STATUSES.map((status) => ({
    ...status,
    count: resources.filter((resource) => resource.status === status.value).length,
  }));
  const total = resources.length;
  let offset = 0;

  return (
    <section className="insight-card insight-resource-chart" aria-labelledby="insight-resource-title">
      <header className="insight-card-header">
        <div>
          <p>LIBRARY · CURRENT</p>
          <h2 id="insight-resource-title">Resource status</h2>
        </div>
      </header>

      <div className="insight-resource-body">
        <svg
          className="insight-donut"
          viewBox="0 0 120 120"
          role="img"
          aria-label={`${total} resources in your library`}
        >
          <circle
            className="insight-donut-track"
            cx="60"
            cy="60"
            r="45"
          />
          <g transform="rotate(-90 60 60)">
            {counts.map((status, index) => {
              const length = total
                ? (status.count / total) * CIRCUMFERENCE
                : 0;
              const currentOffset = offset;
              offset += length;
              return length ? (
                <circle
                  key={status.value}
                  className={`insight-donut-segment ${status.className}`}
                  cx="60"
                  cy="60"
                  r="45"
                  pathLength={CIRCUMFERENCE}
                  strokeDasharray={`var(--segment) ${CIRCUMFERENCE}`}
                  strokeDashoffset={-currentOffset}
                  style={{
                    '--segment': `${length}px`,
                    '--circumference': `${CIRCUMFERENCE}px`,
                    animationDelay: `${index * 140}ms`,
                  } as CSSProperties}
                />
              ) : null;
            })}
          </g>
          <text x="60" y="58" className="insight-donut-total" textAnchor="middle">
            {total}
          </text>
          <text x="60" y="72" className="insight-donut-label" textAnchor="middle">
            RESOURCES
          </text>
        </svg>

        <ul className="insight-resource-legend">
          {counts.map((status) => (
            <li key={status.value}>
              <Link
                to={`/library?status=${encodeURIComponent(status.value)}`}
                className="insight-resource-status-link"
              >
                <span className={`insight-status-dot ${status.className}`} />
                <span>{status.label}</span>
                <strong>{status.count}</strong>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
