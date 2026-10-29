import { Link } from 'react-router';

interface LandingHeaderProps {
  scrolled: boolean;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onScrollTo: (id: string) => void;
}

export default function LandingHeader({
  scrolled,
  menuOpen,
  onToggleMenu,
  onCloseMenu,
  onScrollTo,
}: LandingHeaderProps) {
  return (
    <header className={`public-header ${scrolled ? 'is-scrolled' : ''}`}>
      <Link
        to="/"
        className="public-brand"
        aria-label="Growth OS home"
        onClick={onCloseMenu}
      >
        <span className="brand-mark" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>
          Growth <em>OS</em>
        </span>
      </Link>

      <nav
        className={`public-nav ${menuOpen ? 'is-open' : ''}`}
        aria-label="Public navigation"
      >
        <button type="button" onClick={() => onScrollTo('product')}>
          Product
        </button>
        <button type="button" onClick={() => onScrollTo('how-it-works')}>
          How it works
        </button>
        <button type="button" onClick={() => onScrollTo('timeline-story')}>
          Timeline
        </button>
        <button type="button" onClick={() => onScrollTo('privacy')}>
          Privacy
        </button>

        <span className="public-nav__actions">
          <Link
            to="/login"
            className="public-sign-in"
            onClick={onCloseMenu}
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="button primary"
            onClick={onCloseMenu}
          >
            Start your workspace
          </Link>
        </span>
      </nav>

      <button
        type="button"
        className="public-menu"
        onClick={onToggleMenu}
        aria-expanded={menuOpen}
        aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
      >
        {menuOpen ? '×' : '☰'}
      </button>
    </header>
  );
}
