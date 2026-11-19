import { useEffect, useRef } from 'react';
import { Link } from 'react-router';

interface LandingHeaderProps {
  scrolled: boolean;
  progress: number;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onScrollTo: (id: string) => void;
}

export default function LandingHeader({
  scrolled,
  progress,
  menuOpen,
  onToggleMenu,
  onCloseMenu,
  onScrollTo,
}: LandingHeaderProps) {
  const navRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !navRef.current?.contains(target) &&
        !menuButtonRef.current?.contains(target)
      ) {
        onCloseMenu();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseMenu();
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen, onCloseMenu]);

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
        ref={navRef}
        id="public-navigation"
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
        ref={menuButtonRef}
        type="button"
        className="public-menu"
        onClick={onToggleMenu}
        aria-expanded={menuOpen}
        aria-controls="public-navigation"
        aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
        onKeyDown={(event) => {
          if (event.key !== 'ArrowDown') return;
          event.preventDefault();
          if (!menuOpen) onToggleMenu();
          requestAnimationFrame(() =>
            navRef.current
              ?.querySelector<HTMLElement>('button, a[href]')
              ?.focus(),
          );
        }}
      >
        <span
          className={`menu-icon ${menuOpen ? 'is-open' : ''}`}
          aria-hidden="true"
        >
          <i />
        </span>
      </button>
      <span className="public-progress" aria-label={`${progress}% page progress`}>
        {String(progress).padStart(3, '0')}%
      </span>
    </header>
  );
}
