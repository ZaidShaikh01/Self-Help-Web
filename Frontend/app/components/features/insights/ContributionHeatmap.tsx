import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { countActivityByDate } from '../activity/activityMath';
import type { GrowthActivityEvent } from '../activity/types';
import { toLocalDateInput } from '~/components/features/journal/journalUtils';

interface ContributionHeatmapProps {
  events: GrowthActivityEvent[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

function getActivityLevel(count: number) {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

function getHistoryWeeks() {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const firstMonday = new Date(currentMonday);
  firstMonday.setDate(currentMonday.getDate() - 12 * 7);

  return Array.from({ length: 13 }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date(firstMonday);
      date.setDate(firstMonday.getDate() + weekIndex * 7 + dayIndex);
      return {
        date: toLocalDateInput(date),
        weekday: date.toLocaleDateString(undefined, { weekday: 'long' }),
        label: date.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        isFuture: date > today,
      };
    }),
  );
}

export default function ContributionHeatmap({
  events,
  selectedDate,
  onSelectDate,
}: ContributionHeatmapProps) {
  const activityByDate = countActivityByDate(events);
  const weeks = getHistoryWeeks();
  const selectedCount = selectedDate
    ? activityByDate.get(selectedDate) ?? 0
    : 0;
  const selectedLabel = selectedDate
    ? new Date(`${selectedDate}T12:00:00`).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <section className="insight-card insight-heatmap" aria-labelledby="insight-heatmap-title">
      <header className="insight-card-header">
        <div>
          <p>RECORDED ACTIVITY · 13 WEEKS</p>
          <h2 id="insight-heatmap-title">Contribution history</h2>
        </div>
        <span className="insight-card-range">90 DAY VIEW</span>
      </header>

      <div className="insight-heatmap-body">
        <div className="insight-heatmap-day-labels" aria-hidden="true">
          <span>MON</span>
          <span>WED</span>
          <span>FRI</span>
        </div>
        <div className="insight-heatmap-weeks">
          {weeks.map((week, weekIndex) => (
            <div className="insight-heatmap-week" key={`week-${weekIndex}`}>
              {week.map((day, dayIndex) => {
                if (day.isFuture) {
                  return (
                    <span
                      key={day.date}
                      className="insight-heatmap-cell is-future"
                      aria-hidden="true"
                    />
                  );
                }

                const count = activityByDate.get(day.date) ?? 0;
                const level = getActivityLevel(count);
                return (
                  <button
                    key={day.date}
                    type="button"
                    className={`insight-heatmap-cell level-${level}${
                      day.date === selectedDate ? ' is-selected' : ''
                    }`}
                    style={{
                      animationDelay: `${(weekIndex * 7 + dayIndex) * 5}ms`,
                    }}
                    title={`${day.label}: ${count} recorded ${count === 1 ? 'action' : 'actions'}`}
                    aria-label={`${day.weekday}, ${day.label}: ${count} recorded ${count === 1 ? 'action' : 'actions'}`}
                    aria-pressed={day.date === selectedDate}
                    onClick={() => onSelectDate(day.date)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <footer className="insight-heatmap-footer">
        <div className="insight-heatmap-selected" aria-live="polite">
          <span>{selectedDate ? selectedLabel.toUpperCase() : 'SELECT A DAY'}</span>
          <strong>
            {selectedDate
              ? `${selectedCount} recorded ${selectedCount === 1 ? 'action' : 'actions'}`
              : 'Activity stays connected to its source'}
          </strong>
          {selectedDate && (
            <Link to={`/timeline?date=${encodeURIComponent(selectedDate)}`}>
              Explore day <ArrowRight size={13} aria-hidden="true" />
            </Link>
          )}
        </div>
        <div className="insight-heatmap-legend" aria-label="Activity intensity">
          <span>LESS</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <i
              key={level}
              className={`insight-heatmap-cell level-${level}`}
              aria-hidden="true"
            />
          ))}
          <span>MORE</span>
        </div>
      </footer>
    </section>
  );
}
