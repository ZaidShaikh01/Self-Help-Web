import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import MetricProgressCard from '~/components/common/MetricCard';

interface TodayAsideProps {
  completed: number;
  total: number;
}

const ACTIVITY_COUNTS = [1, 3, 1, 4, 0, 3, 4];

function getWeekActivity() {
  const today = new Date();

  return ACTIVITY_COUNTS.map((events, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (ACTIVITY_COUNTS.length - index - 1));

    return {
      date,
      events,
      label: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      longDate: date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
    };
  });
}

function WeekActivity() {
  const days = useMemo(getWeekActivity, []);
  const [selected, setSelected] = useState(days.length - 1);
  const activeDay = days[selected];

  return (
    <div className="today-week-activity">
      <div
        className="today-week-activity__bars"
        role="group"
        aria-label="Activity for the last seven days"
      >
        {days.map((day, index) => (
          <button
            type="button"
            key={day.date.toISOString()}
            aria-label={`${day.longDate}: ${day.events} recorded ${day.events === 1 ? 'event' : 'events'}`}
            aria-pressed={selected === index}
            className={`today-week-activity__day${selected === index ? ' is-selected' : ''}`}
            onClick={() => setSelected(index)}
          >
            <span style={{ height: `${Math.max(8, day.events * 5)}px` }} />
          </button>
        ))}
      </div>
      <input
        type="range"
        min={0}
        max={days.length - 1}
        value={selected}
        aria-label="Choose a day in your activity history"
        onChange={(event) => setSelected(Number(event.target.value))}
      />
      <div className="today-week-activity__selected">
        <span>{activeDay.longDate}</span>
        <strong>{activeDay.events} RECORDED EVENTS</strong>
        <small>HABIT</small>
        <Link to="/timeline">VIEW TIMELINE</Link>
      </div>
    </div>
  );
}

export default function TodayAside({ completed, total }: TodayAsideProps) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const milestoneDate = yesterday
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
        <WeekActivity />
      </MetricProgressCard>

      <section className="today-upcoming" aria-labelledby="today-upcoming-title">
        <div className="today-section-heading">
          <span>[04]</span>
          <h2 id="today-upcoming-title">COMING UP</h2>
        </div>
        <div className="today-upcoming__item">
          <time>4:30 PM</time>
          <div>
            <strong>Focused study</strong>
            <span>45 minute session</span>
          </div>
        </div>
        <div className="today-upcoming__item">
          <time>8:00 PM</time>
          <div>
            <strong>Daily reflection</strong>
            <span>A quiet prompt</span>
          </div>
        </div>
      </section>

      <section className="today-milestone" aria-label="Recent milestone">
        <span>MILESTONE · {milestoneDate}</span>
        <strong>Four practices, one steady week.</strong>
        <Link to="/habits">VIEW HABITS</Link>
      </section>
    </aside>
  );
}
