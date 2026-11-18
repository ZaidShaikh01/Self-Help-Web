/**
 * StatsRow – responsive grid of four StatCards driven by live dashboard data.
 *
 * Derives metrics from two parallel API calls:
 *  - GET /habits/today  → habits due today + completed count / streak
 *  - GET /resources?type=Book&status=In Progress&limit=50 → books in progress
 *
 * Falls back to loading skeletons while either request is in-flight.
 */
import { useEffect, useState } from 'react';
import { getTodayHabits, type TodayHabit } from '~/lib/habits';
import { fetchResources } from '~/lib/library';
import StatCard from './StatCard';

interface StatsState {
  habitsToday: number;
  habitsCompleted: number;
  booksReading: number;
  streak: number;
  loading: boolean;
}

/** Hard-coded notes count placeholder until a /notes/stats endpoint exists */
const NOTES_PLACEHOLDER = '—';

/**
 * Four-column stats row: Habits Today, Books Reading, Notes Written, Streak Days.
 */
export default function StatsRow() {
  const [stats, setStats] = useState<StatsState>({
    habitsToday: 0,
    habitsCompleted: 0,
    booksReading: 0,
    streak: 0,
    loading: true,
  });

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const [todayHabits, booksRes] = await Promise.all([
          getTodayHabits().catch((): TodayHabit[] => []),
          fetchResources({ type: 'Book', status: 'In Progress', limit: 50 }).catch(
            () => ({ resources: [], totalPages: 1, currentPage: 1, totalResources: 0 }),
          ),
        ]);

        if (!alive) return;

        const completed = todayHabits.filter((h) => h.completed).length;
        // Best streak is the max currentStreak across today's habits
        const streak = todayHabits.reduce(
          (max, h) => Math.max(max, h.habit.currentStreak ?? 0),
          0,
        );

        setStats({
          habitsToday: todayHabits.length,
          habitsCompleted: completed,
          booksReading: booksRes.totalResources,
          streak,
          loading: false,
        });
      } catch {
        if (alive) setStats((s) => ({ ...s, loading: false }));
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const { habitsToday, habitsCompleted, booksReading, streak, loading } = stats;

  const cards = [
    {
      icon: 'habits',
      label: 'Habits Today',
      value: loading ? 0 : `${habitsCompleted}/${habitsToday}`,
      accentColor: 'var(--accent)',
      trend: undefined,
    },
    {
      icon: 'book',
      label: 'Books Reading',
      value: booksReading,
      accentColor: '#8b5cf6',
    },
    {
      icon: 'journal',
      label: 'Notes Written',
      value: NOTES_PLACEHOLDER,
      accentColor: '#0ea5e9',
    },
    {
      icon: 'today',
      label: 'Streak Days',
      value: streak,
      accentColor: '#f59e0b',
      trend: streak > 0 ? streak : undefined,
      trendLabel: streak > 0 ? 'day streak' : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} loading={loading} />
      ))}
    </div>
  );
}
