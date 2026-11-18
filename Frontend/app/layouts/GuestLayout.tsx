import { useEffect, useState } from 'react';
import {
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router';
import { getCurrentUser } from '~/lib/auth';
import Skeleton from '~/components/ui/Skeleton';

export default function GuestLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [checkedPath, setCheckedPath] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let active = true;

    // Hide public content while checking authentication.
    setCheckedPath(null);

    getCurrentUser()
      .then(() => {
        if (active) {
          navigate('/dashboard', { replace: true });
        }
      })
      .catch(() => {
        // No valid session. Allow the public page to render.
        if (active) {
          setCheckedPath(pathname);
        }
      });

    return () => {
      active = false;
    };
  }, [pathname, navigate]);

  if (checkedPath !== pathname) {
    return (
      <main
        className="min-h-screen bg-[var(--canvas)] px-6 py-8"
        role="status"
        aria-label="Checking your session"
      >
        <div className="mx-auto max-w-6xl">
          <div className="flex h-[68px] items-center justify-between border-b border-[var(--border-subtle)]">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
          <div className="grid min-h-[70vh] items-center gap-8 py-12 md:grid-cols-[0.86fr_1.14fr]">
            <div className="space-y-5">
              <Skeleton className="h-3 w-44" />
              <Skeleton className="h-20 w-full max-w-xl" />
              <Skeleton className="h-4 w-full max-w-md" />
              <Skeleton className="h-4 w-4/5 max-w-sm" />
              <div className="flex gap-3 pt-2">
                <Skeleton className="h-11 w-44" />
                <Skeleton className="h-11 w-40" />
              </div>
            </div>
            <Skeleton className="min-h-[320px] rounded-none md:min-h-[480px]" />
          </div>
          <span className="sr-only">Checking your session…</span>
        </div>
      </main>
    );
  }

  return <Outlet />;
}
