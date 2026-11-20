import { api } from './api';

export const PREFERENCES_SYNC_ERROR_EVENT =
  'growth-os:preferences-sync-error';
export const PREFERENCES_SYNC_SUCCESS_EVENT =
  'growth-os:preferences-sync-success';

export interface UserPreferences {
  theme?: 'light' | 'dark';
  sidebarCollapsed: boolean;
}

let pendingPreferenceUpdates = Promise.resolve();

export function getUserPreferences() {
  return api<UserPreferences>('/users/preferences');
}

export async function updateUserPreferences(
  updates: Partial<UserPreferences>,
) {
  const request = pendingPreferenceUpdates.then(() =>
    api<UserPreferences>('/users/preferences', {
      method: 'PATCH',
      body: updates,
    }),
  );
  pendingPreferenceUpdates = request.then(
    () => undefined,
    () => undefined,
  );

  try {
    const preferences = await request;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(PREFERENCES_SYNC_SUCCESS_EVENT));
    }
    return preferences;
  } catch (error) {
    if (typeof window !== 'undefined') {
      const message =
        error instanceof Error ? error.message : 'Please try again.';
      window.dispatchEvent(
        new CustomEvent(PREFERENCES_SYNC_ERROR_EVENT, { detail: message }),
      );
    }
    throw error;
  }
}
