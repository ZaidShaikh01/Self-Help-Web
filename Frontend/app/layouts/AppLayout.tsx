import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { getCurrentUser, type User } from '~/lib/auth';
import { ApiRequestError } from '~/lib/api';
import {
  getUserPreferences,
  PREFERENCES_SYNC_ERROR_EVENT,
  PREFERENCES_SYNC_SUCCESS_EVENT,
} from '~/lib/preferences';
import ScrollProgress from '~/components/layout/ScrollProgress';
import Header from '~/components/layout/Header';
import Sidebar, { applySidebarPreference } from '~/components/layout/Sidebar';
import MobileNav from '~/components/layout/MobileNav';
import PinnedItemsDialog from '~/components/features/pinned/PinnedItemsDialog';
import GlobalSearchDialog from '~/components/features/search/GlobalSearchDialog';
import QuickCaptureDialog, {
  type QuickCaptureKind,
} from '~/components/features/quick-capture/QuickCaptureDialog';
import { Button } from '~/components/ui/Button';
import { AlertBanner } from '~/components/ui/AlertBanner';
import Skeleton from '~/components/ui/Skeleton';
import { useTheme } from '~/hooks/useTheme';

type AuthCheck = {
  pathname: string;
  status: 'authenticated' | 'unavailable';
} | null;

export default function AppLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isDark, setTheme, toggleTheme } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const isToday = pathname === '/dashboard';
  const isTimeline = pathname === '/timeline' || pathname.startsWith('/timeline/');
  const isInsights = pathname === '/insights' || pathname.startsWith('/insights/');
  const isExpenses = pathname === '/expenses' || pathname.startsWith('/expenses/');
  const isGames = pathname === '/games' || pathname.startsWith('/games/');
  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  const openQuickCapture = useCallback(
    () => setIsQuickCaptureOpen(true),
    [],
  );
  const handleQuickCaptureSelect = useCallback(
    (kind: QuickCaptureKind) => {
      setIsQuickCaptureOpen(false);
      if (kind === 'journal') navigate('/journal/new');
      else if (kind === 'habit') {
        navigate('/habits', { state: { openQuickCapture: true } });
      } else {
        navigate('/library', { state: { openQuickCaptureResource: true } });
      }
    },
    [navigate],
  );

  const [authCheck, setAuthCheck] = useState<AuthCheck>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [preferencesError, setPreferencesError] = useState('');
  const [accountUser, setAccountUser] = useState<User | null>(null);
  const [pinnedDialogOpen, setPinnedDialogOpen] = useState(false);

  useEffect(() => {
    const handleSyncError = (event: Event) => {
      setPreferencesError((event as CustomEvent<string>).detail);
    };
    const handleSyncSuccess = () => setPreferencesError('');
    window.addEventListener(PREFERENCES_SYNC_ERROR_EVENT, handleSyncError);
    window.addEventListener(PREFERENCES_SYNC_SUCCESS_EVENT, handleSyncSuccess);
    return () => {
      window.removeEventListener(PREFERENCES_SYNC_ERROR_EVENT, handleSyncError);
      window.removeEventListener(
        PREFERENCES_SYNC_SUCCESS_EVENT,
        handleSyncSuccess,
      );
    };
  }, []);

  useEffect(() => {
    let active = true;

    // The previous verification belongs to another route.
    setAuthCheck(null);

    getCurrentUser()
      .then(async (user) => {
        if (active) setAccountUser(user);
        try {
          const preferences = await getUserPreferences();
          if (active) {
            if (preferences.theme) setTheme(preferences.theme);
            applySidebarPreference(preferences.sidebarCollapsed);
          }
        } catch (error) {
          console.error('Account preferences could not be loaded.', error);
        }
        if (active) {
          setAuthCheck({ pathname, status: 'authenticated' });
        }
      })
      .catch((error: unknown) => {
        if (!active) return;

        if (error instanceof ApiRequestError && error.status === 401) {
          navigate('/login', { replace: true });
          return;
        }

        // Network/server errors are not proof that the session
        // has expired. Keep private content hidden and allow retry.
        setAuthCheck({
          pathname,
          status: 'unavailable',
        });
      });

    return () => {
      active = false;
    };
  }, [pathname, navigate, retryCount, setTheme]);

  // Do not render a route while its authentication check is pending.
  if (!authCheck || authCheck.pathname !== pathname) {
    return (
      <main
        className="grid min-h-screen place-items-center bg-[var(--canvas)] p-6"
        role="status"
        aria-label="Verifying your session"
      >
        <div className="w-full max-w-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-36 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-2/5" />
          <Skeleton className="h-4 w-3/5" />
          <div className="grid gap-4 pt-4 sm:grid-cols-2">
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-36 rounded-xl" />
          </div>
          <span className="sr-only">Verifying your session…</span>
        </div>
      </main>
    );
  }

  // Fail closed if verification cannot be completed.
  if (authCheck.status === 'unavailable') {
    return (
      <main className="min-h-screen grid place-items-center bg-[var(--canvas)] p-6">
        <div className="max-w-md space-y-4 text-center rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8">
          <h1 className="text-lg font-semibold text-[var(--text)]">
            Unable to verify your session
          </h1>

          <p className="text-xs text-[var(--text-2)] leading-relaxed">
            Check your connection and try again. Your private content will
            remain hidden until your session is verified.
          </p>

          <Button
            variant="primary"
            onClick={() => setRetryCount((count) => count + 1)}
          >
            Retry
          </Button>
        </div>
      </main>
    );
  }

  const username = accountUser?.username || accountUser?.fullname || 'You';
  const userInitial = username.trim().charAt(0).toUpperCase() || 'U';

  return (
    <div
      className={`app-root flex h-screen overflow-hidden bg-[var(--canvas)] text-[var(--text)] ${
        isToday ? 'app-root--today' : ''
      }`}
    >
      {preferencesError && (
        <div className="fixed left-1/2 top-3 z-[100] w-[min(100%-2rem,32rem)] -translate-x-1/2">
          <AlertBanner
            message={`Preference update could not be synced: ${preferencesError}`}
            onDismiss={() => setPreferencesError('')}
          />
        </div>
      )}
      <Sidebar
        onQuickCapture={openQuickCapture}
        onPinnedItems={() => setPinnedDialogOpen(true)}
        user={{
          name: username.toUpperCase(),
          workspace: username.toUpperCase(),
          initial: userInitial,
        }}
      />

      {/* Main Content Stage */}
      <div
        className={`flex min-w-0 flex-1 flex-col overflow-hidden bg-[var(--canvas)] ${
          isToday ? 'today-app-stage' : ''
        }`}
      >
        {/* Top Utility Bar */}
        <Header
          onSearch={openSearch}
          onCreate={openQuickCapture}
          onNotifications={() => navigate('/notifications')}
          onPinnedItems={() => setPinnedDialogOpen(true)}
          onToggleTheme={toggleTheme}
          dark={isDark}
          user={{ name: username, initial: userInitial }}
          dashboardMode={isToday}
          scope={isToday || isTimeline || isInsights || isExpenses || isGames ? 'LOC' : undefined}
          section={
            isTimeline
              ? 'Timeline'
              : isInsights
                ? 'Insights'
                : isExpenses
                  ? 'Expenses'
                  : isGames
                    ? 'Games'
                : isToday
                  ? 'Today'
                  : undefined
          }
        />
        <ScrollProgress />

        {/* Scrollable Main Area */}
        <main
          className={`min-h-0 flex-1 overflow-y-auto ${
            isToday ? 'overflow-x-hidden' : ''
          }`}
        >
          <div
            className={
              isToday
                ? 'today-route-shell'
                : 'mx-auto w-full max-w-6xl px-4 py-6 pb-20 sm:px-6 md:pb-8'
            }
          >
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Navigation Bar (< 768px) */}
      <MobileNav onSearch={openSearch} />
      {pinnedDialogOpen && (
        <PinnedItemsDialog onClose={() => setPinnedDialogOpen(false)} />
      )}
      {isSearchOpen && (
        <GlobalSearchDialog onClose={() => setIsSearchOpen(false)} />
      )}
      {isQuickCaptureOpen && (
        <QuickCaptureDialog
          onClose={() => setIsQuickCaptureOpen(false)}
          onSelect={handleQuickCaptureSelect}
        />
      )}
    </div>
  );
}
