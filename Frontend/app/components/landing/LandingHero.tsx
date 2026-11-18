import { Link } from 'react-router';
import ActivityHeatmap from './ActivityHeatmap';

interface LandingHeroProps {
  onScrollTo: (id: string) => void;
  selectedDay: string;
  onSelectDay: (day: string) => void;
}

export default function LandingHero({
  onScrollTo,
  selectedDay,
  onSelectDay,
}: LandingHeroProps) {
  return (
    <section className="landing-hero" id="home">
      <span className="landing-hero__index">LANDING / 00 / 2026.10</span>

      <div className="landing-hero__copy">
        <span className="eyebrow">A personal growth workspace</span>

        <h1>
          See your growth
          <br />
          in context.
        </h1>

        <p>
          Build practices, keep reflections, collect what teaches you, and return
          to a connected history of how your life is changing.
        </p>

        <div className="landing-hero__actions">
          <Link to="/signup" className="button primary">
            Start your workspace
          </Link>
          <button
            type="button"
            className="button"
            onClick={() => onScrollTo('timeline-story')}
          >
            Explore the Timeline <span aria-hidden="true">↗</span>
          </button>
        </div>

        <span className="landing-privacy">
          <i />
          Private by design · Your records remain yours
        </span>
      </div>

      <div
        className="landing-map"
        aria-label="Example connected personal history"
      >
        <span className="landing-map__label">
          PERSONAL HISTORY / OCT 20—24
        </span>

        <svg
          className="landing-map__svg"
          viewBox="0 0 720 430"
          fill="none"
          aria-hidden="true"
        >
          <path
            className="landing-map__grid"
            d="M30 50H690M30 130H690M30 210H690M30 290H690M30 370H690M110 20V410M250 20V410M390 20V410M530 20V410M670 20V410"
          />
          <path
            className="landing-map__path"
            d="M40 350H142V284H282V308H416V178H548V96H680"
          />
          <path
            className="landing-map__relation"
            d="M142 284C196 224 228 201 282 146M416 178C461 232 500 246 548 250M282 308C346 362 443 370 548 250"
          />
          <rect className="map-point" x="137" y="279" width="10" height="10" />
          <rect className="map-point" x="277" y="141" width="10" height="10" />
          <rect className="map-point" x="411" y="173" width="10" height="10" />
          <rect
            className="map-point map-point--active"
            x="542"
            y="244"
            width="12"
            height="12"
          />
        </svg>

        <div className="landing-map__node node-a">
          <i />
          <span>
            <small>08:42 / HABIT</small>
            <strong>Reading complete</strong>
          </span>
        </div>

        <div className="landing-map__node node-b">
          <i />
          <span>
            <small>20:04 / JOURNAL</small>
            <strong>What stayed with me</strong>
          </span>
        </div>

        <div className="landing-map__node node-c">
          <i />
          <span>
            <small>SOURCE / BOOK</small>
            <strong>Atomic Habits</strong>
          </span>
        </div>

        <div className="landing-map__node node-d is-active">
          <i />
          <span>
            <small>CRITERIA MET</small>
            <strong>10 reading sessions</strong>
          </span>
        </div>

        <ActivityHeatmap
          variant="preview"
          selectedDay={selectedDay}
          onSelectDay={onSelectDay}
        />
      </div>

      <button
        type="button"
        className="landing-scroll"
        onClick={() => onScrollTo('how-it-works')}
      >
        <span>Continue</span>
        <span aria-hidden="true">↓</span>
      </button>
    </section>
  );
}
