import { Link } from 'react-router';

interface LandingFeaturesProps {
  selectedView: number;
  onSelectView: (index: number) => void;
}

const WORKFLOW = [
  ['01', 'Capture', 'Complete a habit, write a thought, or save a resource.'],
  ['02', 'Connect', 'Keep sources and related records attached.'],
  ['03', 'Understand', 'Review recorded patterns in Timeline and Insights.'],
  ['04', 'Return', 'Revisit what changed and what still matters.'],
] as const;

const PRODUCT_VIEWS = [
  ['Today', 'One calm place for the next useful action.'],
  ['Habits', 'Repeatable practices without punishment-based streaks.'],
  ['Library', 'A personal archive for what teaches you.'],
  ['Journal', 'Reflections connected to the things that inspired them.'],
  ['Timeline', 'A trustworthy history of actions, thoughts, and learning.'],
  ['Insights', 'Evidence-based patterns with their source data attached.'],
] as const;

const HISTORY_EVENTS = [
  ['08:42', 'Reading marked complete', '20 minutes · Reading habit'],
  ['08:42', 'Today progress updates', 'One of four practices'],
  ['08:43', 'Timeline event appears', 'Source remains attached'],
  ['20:04', 'Reflection adds context', 'Atomic Habits · What stayed with me'],
] as const;

const EVIDENCE_ACTIVE_CELLS = [
  2, 3, 7, 11, 12, 18, 19, 24, 28, 29, 35, 42, 43, 49, 56, 61, 66,
];

export default function LandingFeatures({
  selectedView,
  onSelectView,
}: LandingFeaturesProps) {
  return (
    <>
      {/* 01: Workflow */}
      <section className="landing-section workflow-section" id="how-it-works">
        <header className="landing-section__header">
          <span className="eyebrow">[01] HOW IT CONNECTS</span>
          <h2>
            One record, built
            <br />
            from meaningful actions.
          </h2>
        </header>

        <div className="workflow-line">
          {WORKFLOW.map(([index, title, copy]) => (
            <article key={index}>
              <span>{index}</span>
              <i />
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 02: Product Views Walkthrough */}
      <section className="landing-section product-section" id="product">
        <header className="landing-section__header">
          <span className="eyebrow">[02] SIX VIEWS, ONE HISTORY</span>
          <h2>Not six disconnected tools.</h2>
          <p>Six ways to understand the same personal record.</p>
        </header>

        <div className="product-walkthrough">
          <div className="product-index" role="tablist" aria-label="Product views">
            {PRODUCT_VIEWS.map(([title, copy], index) => (
              <button
                key={title}
                type="button"
                role="tab"
                aria-selected={selectedView === index}
                className={selectedView === index ? 'is-active' : ''}
                onClick={() => onSelectView(index)}
              >
                <span>0{index + 1}</span>
                <strong>{title}</strong>
                <span className="product-index__arrow" aria-hidden="true">
                  ↗
                </span>
                <small>{copy}</small>
              </button>
            ))}
          </div>

          <div className="product-preview" role="tabpanel">
            <div className="product-preview__top">
              <span className="product-preview__status" />
              Growth OS / {PRODUCT_VIEWS[selectedView][0]}
              <b>PRODUCT VIEW</b>
            </div>

            <div className="product-preview__canvas">
              <span className="eyebrow">
                {selectedView === 4
                  ? 'YOUR PERSONAL HISTORY'
                  : `VIEW 0${selectedView + 1}`}
              </span>
              <h3>{PRODUCT_VIEWS[selectedView][0]}</h3>
              <p>{PRODUCT_VIEWS[selectedView][1]}</p>

              <div
                className={`preview-diagram preview-diagram--${selectedView}`}
                aria-hidden="true"
              >
                {Array.from({ length: 5 }, (_, index) => (
                  <i key={index} />
                ))}
                <span />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 03: History Sequence */}
      <section className="landing-section history-section" id="timeline-story">
        <header className="landing-section__header">
          <span className="eyebrow">[03] ACTION BECOMES HISTORY</span>
          <h2>
            A small action stays
            <br />
            connected to its meaning.
          </h2>
        </header>

        <div className="history-sequence">
          {HISTORY_EVENTS.map(([time, title, copy], index) => (
            <article key={`${time}-${title}`}>
              <span>{time}</span>
              <i>{String(index + 1).padStart(2, '0')}</i>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 04: Evidence & Context */}
      <section className="landing-section evidence-section" id="insights-preview">
        <header className="landing-section__header">
          <span className="eyebrow">[04] INSIGHTS WITH CONTEXT</span>
          <h2>Evidence, not pressure.</h2>
          <p>
            Useful statistics describe what was recorded. They do not turn a
            missed day into a verdict.
          </p>
        </header>

        <div className="evidence-preview">
          <div className="evidence-activity">
            <span className="eyebrow">ACTIVITY / SAMPLE VIEW</span>
            <div className="activity-grid" aria-hidden="true">
              {Array.from({ length: 70 }, (_, index) => (
                <i
                  key={index}
                  className={
                    EVIDENCE_ACTIVE_CELLS.includes(index) ? 'has-data' : ''
                  }
                />
              ))}
            </div>
            <small>Illustrative layout, not your actual activity data.</small>
          </div>

          <div className="evidence-statement">
            <span>OBS / 01</span>
            <strong>
              Your progress should explain what happened, not judge you for
              it.
            </strong>
            <small>Patterns should remain connected to their source records.</small>
          </div>
        </div>
      </section>

      {/* 05: Privacy & Control */}
      <section className="landing-section privacy-section" id="privacy">
        <span className="eyebrow">[05] YOUR RECORDS, YOUR CONTROL</span>
        <div>
          <h2>A workspace that respects the life inside it.</h2>
          <p>
            Clear source relationships. Reversible low-risk actions. No
            guilt-driven warnings or manipulative engagement language.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="landing-final">
        <span className="eyebrow">START WHERE YOU ARE</span>
        <h2>Start with one useful action.</h2>
        <p>
          Complete a practice, write a thought, or save something worth
          returning to.
        </p>
        <div>
          <Link to="/signup" className="button primary">
            Create your workspace
          </Link>
          <Link to="/login" className="button">
            Sign in
          </Link>
        </div>
      </section>
    </>
  );
}
