import {
  type RouteConfig,
  index,
  layout,
  route,
} from '@react-router/dev/routes';

export default [
  // Public pages: landing, login, signup
  // Authenticated users are redirected to the dashboard.
  layout('layouts/GuestLayout.tsx', [
    index('routes/home.tsx'),
    route('login', 'routes/login.tsx'),
    route('signup', 'routes/signup.tsx'),
  ]),

  // Protected pages: authentication is checked by AppLayout.
  layout('layouts/AppLayout.tsx', [
    route('dashboard', 'routes/dashboard.tsx'),
    route('habits', 'routes/habits.tsx'),
    route('library', 'routes/library.tsx'),

    // Existing fallback for unfinished features.
    route('*', 'components/ComingSoon.tsx'),
  ]),
] satisfies RouteConfig;
