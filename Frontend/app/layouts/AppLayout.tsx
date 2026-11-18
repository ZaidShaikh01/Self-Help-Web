import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { getCurrentUser } from '~/lib/auth';
import { ApiRequestError } from '~/lib/api';
import ScrollProgress from '~/components/layout/ScrollProgress';
import Header from '~/components/layout/Header';
import Sidebar from '~/components/layout/Sidebar';
import MobileNav from '~/components/layout/MobileNav';
import { Button } from '~/components/ui/Button';
import Skeleton from '~/components/ui/Skeleton';
import { useTheme } from '~/hooks/useTheme';

type AuthCheck = {
  pathname: string;
  status: 'authenticated' | 'unavailable';
} | null;

export default function AppLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const [authCheck, setAuthCheck] = useState<AuthCheck>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    // The previous verification belongs to another route.
    setAuthCheck(null);

    getCurrentUser()
      .then(() => {
        if (active) {
          setAuthCheck({
            pathname,
            status: 'authenticated',
          });
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
  }, [pathname, navigate, retryCount]);

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

  return (
    <div className="app-root flex h-screen overflow-hidden bg-[var(--canvas)] text-[var(--text)]">
      {/* Collapsible Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Stage */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[var(--canvas)]">
        {/* Top Utility Bar */}
        <Header onToggleTheme={toggleTheme} dark={isDark} />
        <ScrollProgress />

        {/* Scrollable Main Area */}
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 pb-20 md:pb-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Navigation Bar (< 768px) */}
      <MobileNav />
    </div>
  );
}
