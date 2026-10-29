import { useEffect, useState } from 'react';
import {
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router';
import { getCurrentUser } from '~/lib/auth';

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
        className="min-h-screen grid place-items-center bg-[var(--canvas)] font-mono text-xs uppercase tracking-widest text-[var(--text-3)]"
        role="status"
      >
        Checking your session…
      </main>
    );
  }

  return <Outlet />;
}
