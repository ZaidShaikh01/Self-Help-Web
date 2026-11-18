import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router';

const FEATURES = [
  {
    title: 'Habit Tracker',
    description:
      'Track daily routines, streaks, and personal consistency metrics.',
    icon: CheckCircle2,
    badge: 'Live',
    to: '/habits',
    live: true,
  },
  {
    title: 'Clips & Reels Vault',
    description:
      'Save inspiring video clips, reels, and media notes in one organized place.',
    icon: ArrowUpRight,
    badge: 'Planned',
    to: null,
    live: false,
  },
] as const;

export default function UpcomingFeatures() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
      {FEATURES.map(({ title, description, icon: Icon, badge, to, live }) => {
        const content = (
          <>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Icon
                  className="h-5 w-5 text-[var(--text-3)]"
                  aria-hidden="true"
                />
                <h3 className="font-semibold text-[var(--text)]">{title}</h3>
              </div>
              <span
                className={`rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${
                  live
                    ? 'bg-[var(--accent-soft)] text-[var(--accent-text)]'
                    : 'bg-[var(--canvas-2)] text-[var(--text-3)]'
                }`}
              >
                {badge}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[var(--text-3)]">
              {description}
            </p>
          </>
        );

        if (to) {
          return (
            <Link
              key={title}
              to={to}
              className="dashboard-panel space-y-3 transition-colors hover:border-[var(--border-strong)]"
            >
              {content}
            </Link>
          );
        }

        return (
          <div
            key={title}
            className="dashboard-panel space-y-3 opacity-80"
            aria-disabled="true"
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}
