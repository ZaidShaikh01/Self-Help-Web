interface ActivityHeatmapProps {
  selectedDay: string;
  onSelectDay: (day: string) => void;
  variant: 'preview' | 'evidence';
}

interface ActivityRecord {
  count: number;
  types: readonly string[];
}

const ACTIVITY: Record<string, ActivityRecord> = {
  '2026-10-11': { count: 1, types: ['resource'] },
  '2026-10-12': { count: 1, types: ['habit'] },
  '2026-10-13': { count: 1, types: ['habit'] },
  '2026-10-14': { count: 1, types: ['habit'] },
  '2026-10-15': { count: 1, types: ['habit'] },
  '2026-10-16': { count: 2, types: ['resource', 'habit'] },
  '2026-10-17': { count: 1, types: ['habit'] },
  '2026-10-18': { count: 2, types: ['resource', 'habit'] },
  '2026-10-19': { count: 2, types: ['habit'] },
  '2026-10-20': { count: 3, types: ['habit', 'journal'] },
  '2026-10-21': { count: 1, types: ['habit'] },
  '2026-10-22': { count: 5, types: ['habit', 'journal', 'resource'] },
  '2026-10-24': { count: 5, types: ['habit', 'journal', 'milestone'] },
};

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAYS = Array.from({ length: 48 }, (_, index) => {
  const date = new Date(Date.UTC(2026, 8, 8 + index));
  const key = date.toISOString().slice(0, 10);
  const record = ACTIVITY[key] ?? { count: 0, types: [] };
  const month = MONTHS[date.getUTCMonth()];
  const label =
    record.count === 0
      ? `${month} ${date.getUTCDate()}: 0 recorded events. No recorded activity`
      : `${month} ${date.getUTCDate()}: ${record.count} recorded ${
          record.count === 1 ? 'event' : 'events'
        }. ${record.types.join(', ')}`;

  return { key, label, count: record.count };
});

function getActivityLevel(count: number) {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return 3;
  return 4;
}

export default function ActivityHeatmap({
  selectedDay,
  onSelectDay,
  variant,
}: ActivityHeatmapProps) {
  return (
    <section
      className={`activity-grid activity-grid--${variant}`}
      aria-label="Recorded activity history"
    >
      <div className="activity-grid__plot-wrap">
        <div className="activity-grid__plot">
          {DAYS.map(({ key, label, count }) => (
            <button
              key={key}
              type="button"
              className={`activity-cell level-${getActivityLevel(count)} ${
                selectedDay === key ? 'is-selected' : ''
              }`}
              aria-label={label}
              aria-pressed={selectedDay === key}
              title={label}
              onClick={() => onSelectDay(key)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
