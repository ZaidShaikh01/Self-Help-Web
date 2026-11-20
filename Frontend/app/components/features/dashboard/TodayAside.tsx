import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import MetricProgressCard from '~/components/common/MetricCard';
import { countActivityByDate } from '~/components/features/activity/activityMath';
import type { GrowthActivityEvent } from '~/components/features/activity/types';
import { toLocalDateInput } from '~/components/features/journal/journalUtils';

interface TodayAsideProps {
  completed: number;
  total: number;
  events: GrowthActivityEvent[];
  isActivityLoading: boolean;
  activityError: string;
  onRetryActivity: () => void;
  nextPractice?: string;
  children?: ReactNode;
}

function getWeekActivity(events: GrowthActivityEvent[]) {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const activityByDate = countActivityByDate(events);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const dateKey = toLocalDateInput(date);

    return {
      date,
      dateKey,
      events: activityByDate.get(dateKey) ?? 0,
      label: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      longDate: date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
    };
  });
}

function WeekActivity({
  events,
  isActivityLoading: isLoading,
  activityError: error,
  onRetryActivity,
}: Pick<
  TodayAsideProps,
  'events' | 'isActivityLoading' | 'activityError' | 'onRetryActivity'
>) {
  const days = useMemo(() => getWeekActivity(events), [events]);
  const [selected, setSelected] = useState(days.length - 1);
  const activeDay = days[selected];
  const peak = Math.max(1, ...days.map((day) => day.events));

  return (
    <div className="today-week-activity">
      {error ? (
        <div className="today-week-activity__message" role="alert">
          <span>{error}</span>
          <button type="button" onClick={onRetryActivity}>Retry</button>
        </div>
      ) : (
        <>
          <div
            className="today-week-activity__bars"
            role="group"
            aria-label="Activity for the last seven days"
          >
            {days.map((day, index) => (
              <button
                type="button"
                key={day.dateKey}
                aria-label={`${day.longDate}: ${day.events} recorded ${day.events === 1 ? 'action' : 'actions'}`}
                aria-pressed={selected === index}
                className={`today-week-activity__day${selected === index ? ' is-selected' : ''}`}
                disabled={isLoading}
                onClick={() => setSelected(index)}
              >
                <span
                  style={{
                    height: `${day.events ? Math.max(5, (day.events / peak) * 28) : 2}px`,
                  }}
                />
              </button>
            ))}
          </div>
          <input
            type="range"
            min={0}
            max={days.length - 1}
            value={selected}
            aria-label="Choose a day in your activity history"
            disabled={isLoading}
            onChange={(event) => setSelected(Number(event.target.value))}
          />
          <div className="today-week-activity__selected">
            <span>{activeDay.longDate}</span>
            <strong>
              {isLoading ? 'LOADING ACTIVITY' : `${activeDay.events} RECORDED ${activeDay.events === 1 ? 'ACTION' : 'ACTIONS'}`}
            </strong>
            <small>HISTORY</small>
            <Link to={`/timeline?date=${encodeURIComponent(activeDay.dateKey)}`}>
              VIEW TIMELINE
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function TodayAside({
  completed,
  total,
  events,
  isActivityLoading,
  activityError,
  onRetryActivity,
  nextPractice,
  children,
}: TodayAsideProps) {
  const todayLabel = new Date()
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    .toUpperCase();

  return (
    <aside className="today-aside">
      <MetricProgressCard
        current={completed}
        total={total}
        description="No perfect day required. Your history is made one useful action at a time."
        className="today-rhythm-card"
      >
        <WeekActivity
          events={events}
          isActivityLoading={isActivityLoading}
          activityError={activityError}
          onRetryActivity={onRetryActivity}
        />
      </MetricProgressCard>

      <section className="today-upcoming" aria-labelledby="today-upcoming-title">
        <div className="today-section-heading">
          <span>[04]</span>
          <h2 id="today-upcoming-title">NEXT STEP</h2>
        </div>
        <div className="today-upcoming__item is-dynamic">
          <span className="today-upcoming__marker" aria-hidden="true" />
          <div>
            <strong>{nextPractice || (total ? 'All practices complete' : 'Start a practice')}</strong>
            <span>
              {nextPractice
                ? 'A habit scheduled for today'
                : total
                  ? 'You showed up for today’s plan'
                  : 'Add a habit to begin tracking'}
            </span>
          </div>
          <Link to="/habits">{total ? 'HABITS' : 'ADD'}</Link>
        </div>
      </section>

      <section className="today-milestone" aria-label="Recent milestone">
        <span>TODAY · {todayLabel}</span>
        <strong>
          {total
            ? `${completed} of ${total} scheduled ${total === 1 ? 'practice' : 'practices'} completed.`
            : 'Your next small step can start here.'}
        </strong>
        <Link to="/insights">VIEW INSIGHTS</Link>
      </section>
      {children}
    </aside>
  );
}
