import { useEffect, useState } from 'react';

const DURATION = 1800;
const STEPS = [
  '001 INITIALIZE PERSONAL INDEX',
  '002 LOAD PRACTICE RECORDS',
  '003 LINK SOURCE OBJECTS',
  '004 BUILD HISTORY AXIS',
  '005 CALIBRATE VIEW',
  '010 SYSTEM READY',
];

export default function LandingIntro() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(false);
      return;
    }

    const startedAt = performance.now();
    const interval = window.setInterval(() => {
      const next = Math.min(
        100,
        Math.round(((performance.now() - startedAt) / DURATION) * 100),
      );
      setProgress(next);

      if (next === 100) {
        window.clearInterval(interval);
        setVisible(false);
      }
    }, 40);

    return () => window.clearInterval(interval);
  }, []);

  if (!visible) return null;

  const activeStep = Math.min(
    STEPS.length - 1,
    Math.floor((progress / 100) * STEPS.length),
  );

  return (
    <div className="landing-intro" role="status" aria-label="Preparing Growth OS">
      <div className="landing-intro__panel">
        <div className="landing-intro__heading">
          <span>GROWTH OS / DIAGNOSTIC SEQUENCE</span>
          <i aria-hidden="true" />
        </div>
        <div className="landing-intro__steps" aria-live="polite">
          {STEPS.map((step, index) => (
            <span
              key={step}
              className={
                index < activeStep
                  ? 'is-complete'
                  : index === activeStep
                    ? 'is-active'
                    : ''
              }
            >
              {step}
            </span>
          ))}
        </div>
        <div
          className="landing-intro__progress"
          role="progressbar"
          aria-label="Preparing Growth OS"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <span style={{ transform: `scaleX(${progress / 100})` }} />
        </div>
        <button
          type="button"
          className="landing-intro__skip"
          onClick={() => setVisible(false)}
        >
          Skip intro
        </button>
      </div>
    </div>
  );
}
