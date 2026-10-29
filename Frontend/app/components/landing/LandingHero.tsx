import { Link } from 'react-router';

interface LandingHeroProps {
  onScrollTo: (id: string) => void;
}

const ACTIVE_CELLS = [1, 3, 4, 8, 9, 14, 15, 18, 21, 22, 27, 29, 32];

export default function LandingHero({ onScrollTo }: LandingHeroProps) {
  return (
    <section className="landing-hero" id="home">
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
        aria-label="Illustration of connected personal history"
      >
        <span className="landing-map__label">
          PERSONAL HISTORY / CONNECTED RECORDS
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
          <circle className="map-point" cx="142" cy="284" r="5" />
          <circle className="map-point" cx="282" cy="146" r="5" />
          <circle className="map-point" cx="416" cy="178" r="5" />
          <circle className="map-point map-point--active" cx="548" cy="250" r="6" />
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
            <small>PROGRESS / 01</small>
            <strong>10 reading sessions</strong>
          </span>
        </div>

        <div className="landing-map__activity">
          <span>ACTIVITY / RECENT</span>
          <div className="activity-grid" aria-label="Illustrative activity grid">
            {Array.from({ length: 35 }, (_, index) => (
              <i
                key={index}
                className={ACTIVE_CELLS.includes(index) ? 'has-data' : ''}
              />
            ))}
          </div>
        </div>
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
