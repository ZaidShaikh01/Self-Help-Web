export const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

export class ApiRequestError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

// Paths where a 401 means "bad credentials", not "session expired".
const NO_REFRESH = ['/users/login', '/users/register', '/users/refresh-token'];

let refreshing: Promise<boolean> | null = null;

// Single-flight: many parallel 401s share ONE refresh call. Two refreshes with
// the same cookie would look like token replay and the server revokes the session.
export function refreshSession(): Promise<boolean> {
  if (!refreshing) {
    refreshing = fetch(`${BASE_URL}/users/refresh-token`, {
      method: 'POST',
      credentials: 'include',
      cache:'no-store',
    })
      .then((r) => r.ok)
      .catch(() => false)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

async function parse(res: Response) {
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiRequestError(res.status, body?.message || `Request failed (${res.status})`);
  }
  return body?.data;
}

export async function api<T = any>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const doFetch = () =>
    fetch(`${BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      credentials: 'include',
      cache:'no-store',
      headers:
        options.body !== undefined
          ? { 'Content-Type': 'application/json' }
          : undefined,
      body:
        options.body !== undefined
          ? JSON.stringify(options.body)
          : undefined,
    });

  let res = await doFetch();
  if (res.status === 401 && !NO_REFRESH.some((p) => path.startsWith(p))) {
    if (await refreshSession()) res = await doFetch();
  }
  return parse(res);
}

export async function apiUpload<T = any>(
  path: string,
  formData: FormData,
  options: { method?: string } = {},
): Promise<T> {
  const doFetch = () =>
    fetch(`${BASE_URL}${path}`, {
      method: options.method ?? 'POST',
      credentials: 'include',
      cache: 'no-store',
      body: formData,
    });

  let res = await doFetch();
  if (res.status === 401 && !NO_REFRESH.some((p) => path.startsWith(p))) {
    if (await refreshSession()) res = await doFetch();
  }
  return parse(res);
}
