import { useState } from 'react';
import PromptReflectionCard from '~/components/common/PromptReflectionCard';
import TodayAside from '~/components/features/dashboard/TodayAside';
import DailyIntention from '~/components/features/dashboard/DailyIntention';
import TodayHero from '~/components/features/dashboard/TodayHero';
import TodayPractices, {
  type TodayPractice,
} from '~/components/features/dashboard/TodayPractices';
import TodayTicker from '~/components/features/dashboard/TodayTicker';

const INITIAL_PRACTICES: TodayPractice[] = [
  {
    id: 'reading',
    title: 'Reading',
    detail: 'Learning · Every day',
    duration: '20 min',
    icon: 'book',
    completed: true,
  },
  {
    id: 'morning-walk',
    title: 'Morning walk',
    detail: 'Wellbeing · 4 days / week',
    duration: '30 min',
    icon: 'path',
    completed: true,
  },
  {
    id: 'daily-reflection',
    title: 'Daily reflection',
    detail: 'Reflection · Every day',
    duration: '1 entry',
    icon: 'edit',
    completed: true,
  },
  {
    id: 'focused-study',
    title: 'Focused study',
    detail: 'Learning · 3 days / week',
    duration: '45 min',
    icon: 'focus',
    completed: true,
  },
];

export default function Dashboard() {
  const [practices, setPractices] = useState(INITIAL_PRACTICES);
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const completed = practices.filter((practice) => practice.completed).length;

  const togglePractice = (id: string) => {
    setPractices((current) =>
      current.map((practice) =>
        practice.id === id
          ? { ...practice, completed: !practice.completed }
          : practice,
      ),
    );
  };

  return (
    <div className="today-dashboard">
      <TodayHero />
      <TodayTicker />

      <div className="today-content-grid">
        <section className="today-main-column" aria-label="Today at a glance">
          <DailyIntention />
          <TodayPractices
            practices={practices}
            onToggle={togglePractice}
          />
          <PromptReflectionCard
            category="OPTIONAL REFLECTION"
            code="OBS / 07"
            title="WHAT FELT A LITTLE EASIER TODAY?"
            subtitle="A note for your history. Keep it short, or leave it for later."
            placeholder="Write one thing you noticed…"
            onSubmit={() => setReflectionSaved(true)}
            className="today-reflection"
          />
          {reflectionSaved && (
            <p className="today-reflection-status" role="status">
              Reflection added to today&apos;s notes.
            </p>
          )}
        </section>

        <TodayAside completed={completed} total={practices.length} />
      </div>
    </div>
  );
}
