function formatStamp(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

interface TodayHeroProps {
  actionCount: number;
  latestActivity?: string;
  activityState: 'loading' | 'ready' | 'error';
}

export default function TodayHero({
  actionCount,
  latestActivity,
  activityState,
}: TodayHeroProps) {
  const today = new Date();
  const weekday = today.toLocaleDateString('en-US', { weekday: 'long' });
  const day = today.toLocaleDateString('en-US', { day: '2-digit' });
  const monthYear = today
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    .toUpperCase();

  return (
    <section className="today-hero" aria-labelledby="today-hero-title">
      <div className="today-hero__meta">
        <span>GROWTH MAP / {formatStamp(today)} +</span>
        <span>GROWTH MAP / {weekday.toUpperCase()} / AXIS 43</span>
      </div>

      <div className="today-hero__copy">
        <h1 id="today-hero-title">
          <span>MAKE TODAY COUNT</span>
          <span>IN YOUR OWN WAY.</span>
        </h1>
        <p>A little progress is still progress.</p>
      </div>

      <svg
        className="today-hero__map"
        viewBox="0 0 640 260"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          className="today-hero__route"
          d="M18 219h132v-42h96v-47h110V94h106V68h157"
        />
        <path
          className="today-hero__route-accent"
          d="M151 219v-42h95m110-47h106V68h55"
        />
        <path className="today-hero__axis" d="M18 30h590M18 130h590M18 228h590M108 18v224M304 18v224M500 18v224" />
        <path className="today-hero__crosshair" d="M150 209v20m-10-10h20M464 58v20m-10-10h20M572 112v18m-9-9h18" />
        <circle className="today-hero__point" cx="151" cy="219" r="5" />
        <circle className="today-hero__point" cx="464" cy="68" r="4" />
      </svg>

      <div className="today-hero__event" aria-live="polite">
        <span>
          {activityState === 'loading'
            ? 'ACTIVITY / LOADING'
            : activityState === 'error'
              ? 'ACTIVITY / UNAVAILABLE'
              : actionCount
                ? `${String(actionCount).padStart(2, '0')} / ACTIVITY RECORDED`
                : '01 / A FRESH PAGE'}
        </span>
        <span>
          {activityState === 'loading'
            ? 'GATHERING YOUR RECENT PROGRESS'
            : activityState === 'error'
              ? 'CHECK YOUR CONNECTION TO REFRESH YOUR ACTIVITY'
              : actionCount
                ? latestActivity || 'PROGRESS LOGGED TODAY'
                : 'YOUR NEXT SMALL STEP CAN START HERE'}
        </span>
      </div>

      <div className="today-hero__date" aria-label={`${weekday}, ${monthYear}`}>
        <span>{weekday}</span>
        <strong>{day}</strong>
        <span>{monthYear}</span>
      </div>

      <span className="today-hero__coordinates" aria-hidden="true">
        X 24.00 / Y 67.00
      </span>
    </section>
  );
}
