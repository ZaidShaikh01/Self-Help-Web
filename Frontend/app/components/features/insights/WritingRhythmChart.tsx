import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import type { JournalEntry } from '~/components/features/journal/types';
import { toLocalDateInput } from '~/components/features/journal/journalUtils';

interface WritingRhythmChartProps {
  entries: JournalEntry[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

function getEightWeeks() {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7) - 7 * 7);

  return Array.from({ length: 8 }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + weekIndex * 7 + dayIndex);
      return {
        date: toLocalDateInput(date),
        label: date.toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        }),
        isFuture: date > today,
      };
    }),
  );
}

export default function WritingRhythmChart({
  entries,
  selectedDate,
  onSelectDate,
}: WritingRhythmChartProps) {
  const weeks = getEightWeeks();
  const entriesByDate = new Map<string, number>();
  const tagCounts = new Map<string, number>();
  for (const entry of entries) {
    const date = toLocalDateInput(new Date(entry.createdAt));
    entriesByDate.set(date, (entriesByDate.get(date) ?? 0) + 1);
    for (const tag of entry.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }
  const mostUsedTag =
    [...tagCounts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ??
    'none yet';
  const weekCount = weeks.filter((week) =>
    week.some((day) => entriesByDate.has(day.date)),
  ).length;

  return (
    <section className="insight-card insight-writing-chart" aria-labelledby="insight-writing-title">
      <header className="insight-card-header">
        <div>
          <p>JOURNAL · LAST 8 WEEKS</p>
          <h2 id="insight-writing-title">Writing rhythm</h2>
        </div>
      </header>

      <div className="insight-writing-weeks">
        {weeks.map((week, weekIndex) => (
          <div className="insight-writing-week" key={`journal-week-${weekIndex}`}>
            {week.map((day, dayIndex) => {
              if (day.isFuture) {
                return <span key={day.date} className="insight-writing-day is-future" />;
              }
              const count = entriesByDate.get(day.date) ?? 0;
              return (
                <button
                  key={day.date}
                  type="button"
                  className={`insight-writing-day count-${Math.min(count, 3)}${
                    day.date === selectedDate ? ' is-selected' : ''
                  }`}
                  title={`${day.label}: ${count} journal ${count === 1 ? 'entry' : 'entries'}`}
                  aria-label={`${day.label}: ${count} journal ${count === 1 ? 'entry' : 'entries'}`}
                  aria-pressed={day.date === selectedDate}
                  style={{
                    animationDelay: `${(weekIndex * 7 + dayIndex) * 8}ms`,
                  }}
                  onClick={() => onSelectDate(day.date)}
                />
              );
            })}
          </div>
        ))}
      </div>

      <footer className="insight-writing-footer">
        <span>
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'} across{' '}
          {weekCount} {weekCount === 1 ? 'week' : 'weeks'} · most used tag:{' '}
          {mostUsedTag}
        </span>
        {selectedDate && (
          <Link to={`/journal?date=${encodeURIComponent(selectedDate)}`}>
            Open journal <ArrowRight size={13} aria-hidden="true" />
          </Link>
        )}
      </footer>
    </section>
  );
}
