export const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';
const API_CACHE_PREFIX = 'self-help-app.api-cache.v1:';

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
let cacheUserId: string | null = null;
const inFlightRequests = new Map<string, Promise<unknown>>();

export function setApiCacheUser(userId: string | null) {
  cacheUserId = userId;
}

export function getApiCacheUser() {
  return cacheUserId;
}

export function clearApiCache(userId = cacheUserId) {
  if (!userId || typeof window === 'undefined') return;

  const keyPrefix = `${API_CACHE_PREFIX}${userId}:`;
  try {
    for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith(keyPrefix)) window.localStorage.removeItem(key);
    }
  } catch (error) {
    console.warn('Unable to clear cached API data.', error);
  }
}

function isCacheable(path: string, method: string) {
  return (
    method === 'GET' &&
    cacheUserId !== null &&
    (path === '/users/preferences' || !path.startsWith('/users/'))
  );
}

function cacheKey(path: string) {
  return `${API_CACHE_PREFIX}${cacheUserId}:${path}`;
}

function readCached<T>(key: string): T | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const stored = window.localStorage.getItem(key);
    if (stored === null) return undefined;
    const cached = JSON.parse(stored) as {
      data: T;
      expiresAt: number | null;
    };
    if (typeof cached.expiresAt === 'number' && cached.expiresAt <= Date.now()) {
      window.localStorage.removeItem(key);
      return undefined;
    }
    return cached.data;
  } catch (error) {
    console.warn('Unable to read cached API data.', error);
    return undefined;
  }
}

function writeCached(key: string, path: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try {
    const dateBoundPath = path.split('?')[0];
    const expiresAt =
      dateBoundPath === '/habits/today' ||
      dateBoundPath === '/dashboard/summary'
        ? new Date(new Date().setHours(24, 0, 0, 0)).getTime()
        : null;
    window.localStorage.setItem(
      key,
      JSON.stringify({ data: value, expiresAt }),
    );
  } catch (error) {
    console.warn('Unable to save API data to the local cache.', error);
  }
}

function invalidateMutationCache(path: string) {
  if (typeof window === 'undefined' || !cacheUserId) return;

  const changedGroup = path.split('?')[0].split('/').filter(Boolean)[0];
  if (!changedGroup) return;

  const keyPrefix = `${API_CACHE_PREFIX}${cacheUserId}:`;
  const groups = new Set([changedGroup, 'dashboard', 'pinned', 'search']);
  if (changedGroup === 'resources') groups.add('notes');

  try {
    for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
      const key = window.localStorage.key(index);
      if (!key?.startsWith(keyPrefix)) continue;
      const cachedPath = key.slice(keyPrefix.length);
      const cachedGroup = cachedPath.split('?')[0].split('/').filter(Boolean)[0];
      if (groups.has(cachedGroup)) window.localStorage.removeItem(key);
    }
  } catch (error) {
    console.warn('Unable to invalidate cached API data.', error);
  }
}

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
  const method = options.method ?? 'GET';
  const shouldCache = isCacheable(path, method);
  const key = shouldCache ? cacheKey(path) : '';

  if (shouldCache) {
    const cached = readCached<T>(key);
    if (cached !== undefined) return cached;

    const existing = inFlightRequests.get(key);
    if (existing) return existing as Promise<T>;
  }

  const doFetch = () =>
    fetch(`${BASE_URL}${path}`, {
      method,
      credentials: 'include',
      cache: 'no-store',
      headers:
        options.body !== undefined
          ? { 'Content-Type': 'application/json' }
          : undefined,
      body:
        options.body !== undefined
          ? JSON.stringify(options.body)
          : undefined,
    });

  const request = (async () => {
    let res = await doFetch();
    if (res.status === 401 && !NO_REFRESH.some((p) => path.startsWith(p))) {
      if (await refreshSession()) res = await doFetch();
    }
    const result = await parse(res);
    if (shouldCache) writeCached(key, path, result);
    else if (method !== 'GET') invalidateMutationCache(path);
    return result;
  })();

  if (shouldCache) {
    inFlightRequests.set(key, request);
    try {
      return await request;
    } finally {
      inFlightRequests.delete(key);
    }
  }

  return request;
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
  const result = await parse(res);
  invalidateMutationCache(path);
  return result;
}
