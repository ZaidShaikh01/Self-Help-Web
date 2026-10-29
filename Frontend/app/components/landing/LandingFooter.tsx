import { Link } from 'react-router';

interface LandingFooterProps {
  onScrollTo: (id: string) => void;
}

export default function LandingFooter({ onScrollTo }: LandingFooterProps) {
  return (
    <footer className="public-footer">
      <div className="public-footer__brand">
        <Link to="/" className="public-brand" aria-label="Growth OS home">
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>
            Growth <em>OS</em>
          </span>
        </Link>
        <p>A measured record of a growing life.</p>
      </div>

      <div>
        <strong>Product</strong>
        <button type="button" onClick={() => onScrollTo('product')}>
          Product views
        </button>
        <button type="button" onClick={() => onScrollTo('timeline-story')}>
          Timeline
        </button>
        <button type="button" onClick={() => onScrollTo('insights-preview')}>
          Insights
        </button>
      </div>

      <div>
        <strong>Resources</strong>
        <button type="button" onClick={() => onScrollTo('how-it-works')}>
          How it works
        </button>
        <button type="button" onClick={() => onScrollTo('privacy')}>
          Privacy
        </button>
        <span>Accessibility</span>
      </div>

      <div>
        <strong>Account</strong>
        <Link to="/login">Sign in</Link>
        <Link to="/signup">Create account</Link>
        <span>© {new Date().getFullYear()} Growth OS</span>
      </div>
    </footer>
  );
}
