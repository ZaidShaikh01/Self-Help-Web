import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Pin } from 'lucide-react';
import { logoutRequest } from '~/lib/auth';
import { ApiRequestError } from '~/lib/api';
import { Icon } from '~/components/ui/Icon';
import { IconButton } from '~/components/ui/Button';
import PinnedItemsDialog from '~/components/features/pinned/PinnedItemsDialog';

export interface HeaderProps {
  section?: string;
  scope?: string;
  hasUnread?: boolean;
  user?: { initial?: string; name?: string };
  onSearch?: () => void;
  onCreate?: () => void;
  onNotifications?: () => void;
  onToggleTheme?: () => void;
  dark?: boolean;
  dashboardMode?: boolean;
}

function resolveSection(pathname: string): string {
  if (pathname.startsWith('/habits')) return 'HABITS';
  if (pathname.startsWith('/library')) return 'LIBRARY';
  if (pathname.startsWith('/journal')) return 'JOURNAL';
  if (pathname.startsWith('/timeline')) return 'TIMELINE';
  if (pathname.startsWith('/insights')) return 'INSIGHTS';
  if (pathname.startsWith('/settings')) return 'SETTINGS';
  return 'TODAY';
}

export default function Header({
  section,
  scope = 'GROWTH OS',
  hasUnread = true,
  user = { initial: 'A' },
  onSearch = () => {},
  onCreate = () => {},
  onNotifications = () => {},
  onToggleTheme = () => {},
  dark = false,
  dashboardMode = false,
}: HeaderProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pinnedDialogOpen, setPinnedDialogOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const resolvedSection = section ?? resolveSection(pathname);

  // ⌘K / Ctrl+K keyboard shortcut opens search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onSearch();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onSearch]);

  // Close the account menu on outside click or Escape and support menu keys.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }

      if (
        !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key) ||
        !menuRef.current?.contains(document.activeElement)
      ) {
        return;
      }

      const items = menuRef.current.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"]',
      );
      if (items.length === 0) return;

      const currentIndex = Array.from(items).indexOf(
        document.activeElement as HTMLButtonElement,
      );
      const nextIndex =
        e.key === 'Home'
          ? 0
          : e.key === 'End'
            ? items.length - 1
            : currentIndex < 0
              ? e.key === 'ArrowDown'
                ? 0
                : items.length - 1
              : (currentIndex +
                  (e.key === 'ArrowDown' ? 1 : -1) +
                  items.length) %
                items.length;

      e.preventDefault();
      items[nextIndex].focus();
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      await logoutRequest();
      navigate('/login', { replace: true });
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        navigate('/login', { replace: true });
        return;
      }
      console.error('Logout failed:', error);
      window.alert('Logout could not be completed. Please try again.');
    }
  };

  return (
    <header className="utility-bar font-mono text-[11px] text-[var(--text)]">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2">
        <span className="font-semibold text-[var(--accent)]">{scope}</span>
        <span className="text-[var(--border)]">/</span>
        <span className="truncate font-medium text-[var(--text)]">{resolvedSection}</span>
      </nav>

      {/* Actions Toolbar */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
        {/* Search trigger (desktop button / mobile icon) */}
        <button
          type="button"
          onClick={onSearch}
          aria-label={`${dashboardMode ? 'Search anything' : 'Search'} (⌘K)`}
          className={`hidden h-9 w-44 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 text-[10px] uppercase tracking-wider text-[var(--text-3)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)] lg:flex ${
            dashboardMode ? 'today-toolbar-search' : 'xl:w-56'
          }`}
        >
          <Icon name="search" size={15} />
          <span className="flex-1 text-left">
            {dashboardMode ? 'Search anything' : 'Search…'}
          </span>
          <kbd className="text-[9px]">⌘K</kbd>
        </button>

        <button
          type="button"
          onClick={onSearch}
          aria-label="Search (⌘K)"
          className="icon-button lg:hidden"
        >
          <Icon name="search" size={17} />
        </button>

        {/* Create / Quick Capture */}
        <button
          type="button"
          onClick={onCreate}
          aria-label="Create new"
          className="icon-button hidden sm:inline-grid"
        >
          <Icon name="plus" size={17} />
        </button>

        <button
          type="button"
          onClick={() => setPinnedDialogOpen(true)}
          aria-label="Open pinned items"
          title="Pinned items"
          className="icon-button"
        >
          <Pin size={16} />
        </button>

        {/* Notifications */}
        <button
          type="button"
          onClick={onNotifications}
          aria-label="Notifications"
          className="icon-button relative"
        >
          <Icon name="bell" size={17} />
          {hasUnread && (
            <span
              className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
              aria-hidden="true"
            />
          )}
        </button>

        {/* Theme Toggle (preserved) */}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={`Switch theme (currently ${dark ? 'dark' : 'light'})`}
          className={`icon-button hidden sm:inline-grid ${
            dashboardMode ? 'today-theme-toggle' : ''
          }`}
        >
          <Icon name={dark ? 'sun' : 'moon'} size={17} />
          {dashboardMode && <span>{dark ? 'LIGHT' : 'DARK'}</span>}
        </button>

        {/* Logout (desktop) */}
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Sign out"
          className="hidden cursor-pointer items-center gap-1.5 rounded-lg border border-transparent px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-wider text-[var(--text-2)] transition-colors hover:border-[var(--border-subtle)] hover:bg-[var(--surface)] hover:text-[var(--text)] md:flex"
        >
          <Icon name="arrow" size={14} />
          <span>Sign out</span>
        </button>

        {/* User Avatar & Dropdown Menu */}
        <div ref={menuRef} className="relative">
          <button
            ref={menuButtonRef}
            type="button"
            aria-label={`Account menu for ${user.name ?? 'your account'}`}
            aria-haspopup="menu"
            aria-controls="account-menu"
            aria-expanded={menuOpen}
            title={user.name}
            onKeyDown={(event) => {
              if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
              event.preventDefault();
              setMenuOpen(true);
              requestAnimationFrame(() => {
                const items = menuRef.current?.querySelectorAll<HTMLButtonElement>(
                  '[role="menuitem"]',
                );
                const index = event.key === 'ArrowDown' ? 0 : (items?.length ?? 1) - 1;
                items?.[index]?.focus();
              });
            }}
            onClick={() => setMenuOpen((open) => !open)}
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-[var(--granite-strong)] font-sans text-xs font-semibold text-[var(--surface)] transition-transform hover:scale-105"
          >
            {user.initial}
          </button>

          {menuOpen && (
            <div
              id="account-menu"
              role="menu"
              className="account-menu absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-lg"
            >
              <button
                type="button"
                role="menuitem"
                className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-[11px] uppercase tracking-wide text-[var(--text)] hover:bg-[var(--canvas-2)]"
                onClick={() => {
                  setMenuOpen(false);
                  onCreate();
                }}
              >
                <Icon name="plus" size={15} /> Create new
              </button>
              <button
                type="button"
                role="menuitem"
                className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-[11px] uppercase tracking-wide text-[var(--text)] hover:bg-[var(--canvas-2)]"
                onClick={() => {
                  setMenuOpen(false);
                  onToggleTheme();
                }}
              >
                <Icon name={dark ? 'sun' : 'moon'} size={15} />
                {dark ? 'Light mode' : 'Dark mode'}
              </button>
              <button
                type="button"
                role="menuitem"
                className="flex w-full cursor-pointer items-center gap-2.5 border-t border-[var(--border-subtle)] px-3.5 py-2.5 text-left text-[11px] uppercase tracking-wide text-red-600 hover:bg-red-50"
                onClick={handleLogout}
              >
                <Icon name="arrow" size={15} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
      {pinnedDialogOpen && (
        <PinnedItemsDialog onClose={() => setPinnedDialogOpen(false)} />
      )}
    </header>
  );
}
