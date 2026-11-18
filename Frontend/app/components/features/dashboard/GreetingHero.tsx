/**
 * GreetingHero – Top-of-dashboard greeting with current date/time.
 *
 * Shows a time-sensitive salutation ("Good morning / afternoon / evening"),
 * the user's name, today's formatted date, and a motivational subtitle.
 * Fades in via a CSS keyframe animation on mount.
 */
import { useEffect, useState } from 'react';

/** Time-of-day greeting helper */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/** Format today's date, e.g. "Wednesday, November 18" */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/** Format current time, e.g. "9:41 AM" */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export interface GreetingHeroProps {
  /** Name to greet. Defaults to "there" */
  name?: string;
}

/**
 * Dashboard hero banner with live-updating greeting and clock.
 */
export default function GreetingHero({ name = 'there' }: GreetingHeroProps) {
  const [now, setNow] = useState(() => new Date());

  // Tick every 30 s so the time stays fresh without hammering the renderer.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const greeting = getGreeting();
  const date = formatDate(now);
  const time = formatTime(now);

  return (
    <section
      className="greeting-hero rounded-xl p-6 sm:p-8 flex flex-col gap-2"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        animation: 'greeting-fadein 0.5s ease both',
      }}
    >
      {/* Eyebrow / timestamp */}
      <p
        className="text-xs font-medium tracking-widest uppercase"
        style={{ color: 'var(--text-3)', fontFamily: 'var(--mono)' }}
      >
        {date} · {time}
      </p>

      {/* Main greeting */}
      <h1
        className="text-2xl sm:text-3xl font-semibold leading-tight"
        style={{ color: 'var(--text)' }}
      >
        {greeting},{' '}
        <span style={{ color: 'var(--accent)' }}>{name}</span> 👋
      </h1>

      {/* Motivational subtitle */}
      <p className="text-sm" style={{ color: 'var(--text-2)' }}>
        Here's a snapshot of your growth today.
      </p>

      {/* Inline keyframe definition — zero runtime dependency */}
      <style>{`
        @keyframes greeting-fadein {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
