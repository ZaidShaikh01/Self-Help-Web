import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';
import { NavLink } from 'react-router';
import { gsap } from 'gsap';
import { Pin } from 'lucide-react';
import { Icon, type IconName } from '~/components/ui/Icon';
import { getApiCacheUser } from '~/lib/api';
import { updateUserPreferences } from '~/lib/preferences';

interface User {
  name: string;
  workspace: string;
  initial: string;
}

interface SidebarProps {
  onNavigate?: (id: string) => void;
  onQuickCapture?: () => void;
  onPinnedItems?: () => void;
  user?: User;
}

// Routes match routes.ts; the Today experience maps to /dashboard
const NAV: Array<{ id: string; label: string; icon: IconName; to: string }> = [
  { id: 'today', label: 'TODAY', icon: 'today', to: '/dashboard' },
  { id: 'habits', label: 'HABITS', icon: 'habits', to: '/habits' },
  { id: 'library', label: 'LIBRARY', icon: 'library', to: '/library' },
  { id: 'journal', label: 'JOURNAL', icon: 'journal', to: '/journal' },
  { id: 'expenses', label: 'EXPENSES', icon: 'wallet', to: '/expenses' },
  { id: 'games', label: 'GAMES', icon: 'games', to: '/games' },
  { id: 'timeline', label: 'TIMELINE', icon: 'timeline', to: '/timeline' },
  { id: 'insights', label: 'INSIGHTS', icon: 'insights', to: '/insights' },
  { id: 'notifications', label: 'NOTIFICATIONS', icon: 'bell', to: '/notifications' },
];

// Dimensions strictly matching reference: 248px open, 72px rail
const WIDTH_OPEN = 248;
const WIDTH_RAIL = 72;
const FADE_OUT = 0.12;
const SLIDE = 0.45;
const SLIDE_EASE = 'power3.inOut';

// Mac dock magnification settings
const DOCK_MAX_RAIL = 1.3;
const DOCK_MAX_OPEN = 1.08;
const DOCK_SIGMA = 25;

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', cb);
      return () => mql.removeEventListener('change', cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

const COLLAPSE_KEY = 'sidebar-collapsed';
const listeners = new Set<() => void>();
const readCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === '1';
  } catch (error) {
    console.warn('Sidebar preference could not be read locally.', error);
    return false;
  }
};
const writeCollapsed = (v: boolean, syncBackend = true) => {
  try {
    localStorage.setItem(COLLAPSE_KEY, v ? '1' : '0');
  } catch (error) {
    console.warn('Sidebar preference could not be saved locally.', error);
  }
  listeners.forEach((l) => l());

  if (syncBackend && getApiCacheUser()) {
    void updateUserPreferences({ sidebarCollapsed: v }).catch((error: unknown) => {
      console.error('Sidebar preference could not be synced.', error);
    });
  }
};

export function applySidebarPreference(collapsed: boolean) {
  writeCollapsed(collapsed, false);
}
function useStoredCollapsed(): [boolean, (v: boolean) => void] {
  const value = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    readCollapsed,
    () => false,
  );
  return [value, writeCollapsed];
}

export default function Sidebar({
  onNavigate = () => {},
  onQuickCapture = () => {},
  onPinnedItems = () => {},
  user = { name: 'ALEX MORGAN', workspace: 'ALEX', initial: 'A' },
}: SidebarProps) {
  const [manualCollapsed, setManualCollapsed] = useStoredCollapsed();
  const isSmall = useMediaQuery('(max-width: 1023px)');

  const targetCollapsed = isSmall || manualCollapsed;
  const [collapsed, setCollapsed] = useState(targetCollapsed);

  const asideRef = useRef<HTMLElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const readyRef = useRef(false);
  const dockFrameRef = useRef<number | null>(null);
  const dockPointerRef = useRef<{
    element: HTMLElement;
    clientY: number;
  } | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      readyRef.current = true;
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(
    () => () => {
      tlRef.current?.kill();
      if (dockFrameRef.current !== null) {
        cancelAnimationFrame(dockFrameRef.current);
      }
    },
    [],
  );

  // GSAP slide transition when collapse target changes
  useEffect(() => {
    const el = asideRef.current;
    if (!el) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const children = Array.from(el.children) as HTMLElement[];

    if (!readyRef.current || reduce) {
      tlRef.current?.kill();
      tlRef.current = null;
      gsap.set(el, { clearProps: 'width' });
      gsap.set(children, { clearProps: 'opacity' });
      setCollapsed(targetCollapsed);
      return;
    }

    if (targetCollapsed === collapsed && !tlRef.current) return;

    const navs = el.querySelectorAll('[data-nav]');
    const from = el.offsetWidth;
    const to = targetCollapsed ? WIDTH_RAIL : WIDTH_OPEN;

    tlRef.current?.kill();
    gsap.set(el, { width: from });

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(el, { clearProps: 'width' });
        gsap.set(children, { clearProps: 'opacity' });
        gsap.set(navs, { x: 0 });
        tlRef.current = null;
      },
    });
    tlRef.current = tl;

    if (collapsed !== targetCollapsed) {
      tl.to(children, {
        opacity: 0,
        duration: FADE_OUT,
        ease: 'power1.out',
      }).add(() => {
        flushSync(() => setCollapsed(targetCollapsed));
      });
    }

    tl.to(el, { width: to, duration: SLIDE, ease: SLIDE_EASE })
      .to(children, { opacity: 1, duration: 0.25, ease: 'power1.out' }, '>-0.2')
      .fromTo(navs, { x: -10 }, { x: 0, duration: 0.3, ease: 'power2.out', stagger: 0.04 }, '<');
  }, [targetCollapsed]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mac dock pointer interaction
  const setDockScale = (el: HTMLElement, v: number) => {
    gsap.to(el, {
      scale: v,
      transformOrigin: '50% 50%',
      duration: 0.25,
      ease: 'power3.out',
      overwrite: 'auto',
    });
    el.style.zIndex = v > 1.02 ? String(Math.round(v * 10)) : '';
  };

  const handleDockMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType === 'touch') return;
    if (tlRef.current?.isActive()) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    dockPointerRef.current = {
      element: e.currentTarget,
      clientY: e.clientY,
    };
    if (dockFrameRef.current !== null) return;

    dockFrameRef.current = requestAnimationFrame(() => {
      dockFrameRef.current = null;
      const pointer = dockPointerRef.current;
      if (!pointer || tlRef.current?.isActive()) return;

      const max = collapsed ? DOCK_MAX_RAIL : DOCK_MAX_OPEN;
      pointer.element.querySelectorAll<HTMLElement>('[data-dock]').forEach((el) => {
        const r = el.getBoundingClientRect();
        const d = pointer.clientY - (r.top + r.height / 2);
        const falloff = Math.exp(-(d * d) / (2 * DOCK_SIGMA * DOCK_SIGMA));
        setDockScale(el, 1 + (max - 1) * falloff);
      });
    });
  };

  const handleDockLeave = (e: React.PointerEvent<HTMLElement>) => {
    dockPointerRef.current = null;
    if (dockFrameRef.current !== null) {
      cancelAnimationFrame(dockFrameRef.current);
      dockFrameRef.current = null;
    }

    e.currentTarget.querySelectorAll<HTMLElement>('[data-dock]').forEach((el) => setDockScale(el, 1));
  };

  return (
    <aside
      ref={asideRef}
      onClick={() => {
        if (manualCollapsed && !isSmall) setManualCollapsed(false);
      }}
      className={`growth-sidebar hidden md:flex sticky top-0 h-screen shrink-0 flex-col overflow-hidden border-r border-[var(--border)] bg-[var(--canvas-2)] font-mono text-[12px] text-[var(--text)] transition-colors ${
        collapsed ? 'w-[72px] px-2' : 'w-[248px] px-3'
      } ${collapsed && !isSmall ? 'cursor-pointer' : ''}`}
    >
      {/* Brand Header */}
      <div
        className={`flex h-[58px] shrink-0 items-center border-b border-[var(--border-subtle)] ${
          collapsed ? 'justify-center px-1' : 'justify-between px-2'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          {!collapsed && (
            <span className="font-sans text-[14px] font-bold tracking-tight text-[var(--text)] uppercase">
              GROWTH <span className="text-[var(--accent)] font-semibold">OS</span>
            </span>
          )}
        </div>

        {!collapsed && (
          <button
            type="button"
            aria-label="Collapse sidebar"
            onClick={(e) => {
              e.stopPropagation();
              setManualCollapsed(true);
            }}
            className="cursor-pointer text-[var(--text-3)] transition-colors hover:text-[var(--text)]"
          >
            <span className="rotate-180 inline-block">
              <Icon name="chevron" size={16} />
            </span>
          </button>
        )}
      </div>

      {/* Main Nav Content */}
      <div
        onPointerMove={handleDockMove}
        onPointerLeave={handleDockLeave}
        className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden pt-3 pb-2"
      >
        {/* Workspace Card */}
        {collapsed ? (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mb-3 flex w-full cursor-default flex-col items-center gap-2"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] font-sans text-xs font-semibold text-white">
              {user.initial}
            </span>
            <div className="my-1 w-full border-t border-[var(--border-subtle)]" />
          </div>
        ) : (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mb-3 flex w-full items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] font-sans text-xs font-semibold text-white">
                {user.initial}
              </span>
              <div className="leading-tight">
                <span className="block font-sans text-[12px] font-bold text-[var(--text)]">
                  {user.workspace}
                </span>
                <span className="block font-sans text-[10px] text-[var(--text-3)]">
                  Personal workspace
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Primary Navigation */}
        <nav
          className={`flex w-full flex-col gap-1.5 ${collapsed ? 'items-center' : ''}`}
          aria-label="Sidebar navigation"
        >
          {NAV.map(({ id, label, icon, to }, i) => (
            <NavLink
              key={id}
              to={to}
              data-nav
              data-dock
              title={collapsed ? label : undefined}
              aria-label={label}
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(id);
              }}
              className={({ isActive }) =>
                `relative flex cursor-pointer items-center rounded-lg border border-transparent transition-colors ${
                  collapsed
                    ? 'h-10 w-[50px] justify-center px-1 text-[9px]'
                    : 'w-full px-3 py-2 text-[11px] tracking-wider'
                } ${
                  isActive
                    ? 'is-active bg-transparent text-[var(--accent)] font-semibold border-transparent'
                    : 'text-[var(--text-2)] hover:bg-[var(--surface)] hover:text-[var(--text)]'
                }`
              }
            >
              <Icon name={icon} size={collapsed ? 17 : 18} />
              {collapsed ? null : (
                <>
                  <span className="ml-2.5 flex-1 text-left">{label}</span>
                  <span className="text-[9px] text-[var(--text-3)] font-mono">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Divider */}
        <div
          className={`my-3 border-t border-[var(--border-subtle)] ${collapsed ? 'w-8 self-center' : 'w-full'}`}
        />

        {/* Quick Capture */}
        {collapsed ? (
          <div className="flex w-full flex-col items-center gap-2">
            <button
              type="button"
              aria-label="Quick capture"
              title="Quick capture"
              onClick={(e) => {
                e.stopPropagation();
                onQuickCapture();
              }}
              data-dock
              className="flex h-10 w-[50px] cursor-pointer items-center justify-center rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
            >
              <Icon name="plus" size={17} />
            </button>

            <button
              type="button"
              aria-label="Pinned items"
              title="Pinned items"
              onClick={(e) => {
                e.stopPropagation();
                onPinnedItems();
              }}
              data-dock
              className="flex h-10 w-[50px] cursor-pointer items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-2)] hover:border-[var(--border-strong)] hover:text-[var(--accent)]"
            >
              <Pin size={17} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickCapture();
              }}
              data-dock
              className="flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[var(--accent)] text-[10px] font-bold tracking-wider text-white transition-colors hover:bg-[var(--accent-hover)]"
            >
              <Icon name="plus" size={16} /> QUICK CAPTURE
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPinnedItems();
              }}
              data-dock
              className="mt-2 flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-left text-[10px] font-semibold tracking-wider text-[var(--text-2)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--accent)]"
            >
              <Pin size={15} />
              PINNED ITEMS
            </button>
          </div>
        )}
      </div>

      {/* Footer Profile / Expand Toggle */}
      <div
        className={`border-t border-[var(--border-subtle)] py-2.5 ${
          collapsed ? 'flex flex-col items-center gap-2' : 'px-1'
        }`}
      >
        {collapsed ? (
          <>
            {!isSmall && (
              <button
                type="button"
                aria-label="Expand sidebar"
                onClick={(e) => {
                  e.stopPropagation();
                  setManualCollapsed(false);
                }}
                className="cursor-pointer p-1 text-[var(--text-3)] hover:text-[var(--text)]"
              >
                <Icon name="chevron" size={16} />
              </button>
            )}
            <span
              onClick={(e) => e.stopPropagation()}
              className="flex h-8 w-8 cursor-default items-center justify-center rounded-full bg-[var(--accent)] font-sans text-xs font-semibold text-white"
            >
              {user.initial}
            </span>
          </>
        ) : (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex w-full items-center gap-2.5 px-1 py-1 text-left"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] font-sans text-xs font-semibold text-white">
              {user.initial}
            </span>
            <div className="leading-tight">
              <span className="block text-[11px] font-bold tracking-wider text-[var(--text)]">
                {user.name}
              </span>
              <span className="block font-sans text-[10px] text-[var(--text-3)]">
                Settings &amp; system
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
