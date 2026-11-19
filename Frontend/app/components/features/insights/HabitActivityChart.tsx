import type { InsightRangeData } from './insightsData';

interface HabitActivityChartProps {
  days: InsightRangeData['habitDays'];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  selectedCount: number;
}

export default function HabitActivityChart({
  days,
  selectedDate,
  onSelectDate,
  selectedCount,
}: HabitActivityChartProps) {
  const peak = Math.max(1, ...days.map((day) => day.completed));

  return (
    <section className="insight-card insight-habit-chart" aria-labelledby="insight-habit-chart-title">
      <header className="insight-card-header">
        <div>
          <p>HABITS · LAST 7 DAYS</p>
          <h2 id="insight-habit-chart-title">Activity over time</h2>
        </div>
        <span className="insight-chart-legend">
          <i aria-hidden="true" />
          Completed actions
        </span>
      </header>

      <div className="insight-bar-chart" role="group" aria-label="Habit completions by day">
        {days.map((day, index) => {
          const height = day.completed
            ? Math.max(5, (day.completed / peak) * 100)
            : 2;
          return (
            <button
              key={day.date}
              type="button"
              className={`insight-bar-column${day.date === selectedDate ? ' is-selected' : ''}`}
              aria-label={`${day.weekday}, ${day.completed} of ${day.scheduled} scheduled habits completed`}
              aria-pressed={day.date === selectedDate}
              onClick={() => onSelectDate(day.date)}
            >
              <span className="insight-bar-value">{day.completed || ''}</span>
              <span
                className="insight-bar"
                style={{
                  height: `${height}%`,
                  animationDelay: `${index * 100}ms`,
                }}
              />
              <span className="insight-bar-label">{day.weekday}</span>
            </button>
          );
        })}
      </div>

      <div className="insight-observation">
        <span>OBS / 01</span>
        <strong>
          {selectedDate
            ? `${selectedCount} recorded ${selectedCount === 1 ? 'action' : 'actions'} on this day.`
            : 'Select a day to inspect the recorded habit activity.'}
        </strong>
      </div>
    </section>
  );
}
