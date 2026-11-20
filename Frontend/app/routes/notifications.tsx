import { Bell, CalendarClock, History, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';
import ReminderSettings from '~/components/features/habits/ReminderSettings';

const DETAILS = [
  {
    icon: CalendarClock,
    title: 'Habit reminders',
    description: 'Get a nudge at the times you choose for each habit.',
  },
  {
    icon: ShieldCheck,
    title: 'Your devices, your choice',
    description: 'Push permissions and subscriptions are managed per device.',
  },
];

export default function NotificationsPage() {
  return (
    <section className="route-enter space-y-7 pb-10 text-[var(--text)]">
      <header className="border-b border-[var(--border-subtle)] pb-5">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          Personal signals
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Notifications
            </h1>
            <p className="mt-1 max-w-xl text-sm text-[var(--text-3)]">
              Keep the reminders that help. Leave the noise behind.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 font-mono text-[9px] uppercase tracking-wider text-[var(--text-2)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            Device controls
          </span>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7">
          <div
            className="pointer-events-none absolute -right-10 -top-14 h-48 w-48 rounded-full border-[28px] border-[var(--accent-soft)] opacity-70"
            aria-hidden="true"
          />
          <div className="relative">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <Bell size={20} aria-hidden="true" />
            </span>
            <p className="mt-5 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--text-3)]">
              A little structure, at the right moment
            </p>
            <h2 className="mt-2 max-w-lg text-xl font-semibold tracking-tight sm:text-2xl">
              Make space for the habits you want to keep.
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-[var(--text-3)]">
              Turn on browser reminders for this device, then choose reminder
              times inside your habits. You stay in control of when they arrive.
            </p>
            <Link
              to="/habits"
              className="mt-5 inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[var(--accent-hover)]"
            >
              Set up a habit
            </Link>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {DETAILS.map(({ icon: DetailIcon, title, description }, index) => (
            <article
              key={title}
              className="flex items-start gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-2)] p-4"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)]">
                <DetailIcon size={17} aria-hidden="true" />
              </span>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-3)]">
                  0{index + 1} / HOW IT WORKS
                </p>
                <h3 className="mt-1 text-sm font-semibold">{title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-[var(--text-3)]">
                  {description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <section aria-labelledby="notification-device-title" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              Delivery
            </p>
            <h2
              id="notification-device-title"
              className="mt-1 text-base font-semibold"
            >
              This device
            </h2>
          </div>
          <p className="text-xs text-[var(--text-3)]">
            Browser permission is required for push reminders.
          </p>
        </div>
        <ReminderSettings />
      </section>

      <section
        aria-labelledby="notification-history-title"
        className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]"
      >
        <header className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-3.5 sm:px-5">
          <History size={16} className="text-[var(--text-3)]" aria-hidden="true" />
          <div>
            <h2 id="notification-history-title" className="text-sm font-semibold">
              Notification history
            </h2>
            <p className="mt-0.5 text-[11px] text-[var(--text-3)]">
              Recent activity from your reminders
            </p>
          </div>
        </header>
        <div className="px-5 py-8 text-center">
          <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-[var(--canvas-2)] text-[var(--text-3)]">
            <Bell size={17} aria-hidden="true" />
          </span>
          <h3 className="mt-3 text-sm font-medium">Nothing in your history yet</h3>
          <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-[var(--text-3)]">
            Push reminders are delivered directly to your device and are not
            stored as in-app messages. Your reminder settings are always
            available here.
          </p>
        </div>
      </section>
    </section>
  );
}
