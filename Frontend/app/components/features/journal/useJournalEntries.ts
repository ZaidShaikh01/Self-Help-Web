import { useCallback, useEffect, useState } from 'react';
import type { JournalEntry, JournalEntryInput } from './types';
import {
  JOURNAL_MIGRATION_KEY_PREFIX,
  JOURNAL_STORAGE_KEY,
  JOURNAL_UPDATED_EVENT,
  journalStorageKeyForUser,
  readJournalEntries,
} from './journalStorage';
import {
  createJournalEntry as createJournalEntryRequest,
  deleteJournalEntry as deleteJournalEntryRequest,
  fetchJournalEntries,
  updateJournalEntry as updateJournalEntryRequest,
} from '~/lib/journal';
import { getApiCacheUser } from '~/lib/api';

function messageFrom(error: unknown) {
  return error instanceof Error ? error.message : 'Please try again.';
}

export default function useJournalEntries() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [storageError, setStorageError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const persistEntries = useCallback((nextEntries: JournalEntry[]) => {
    const userId = getApiCacheUser();
    if (!userId) {
      setStorageError('Your account could not be verified. Reload and try again.');
      return;
    }

    try {
      window.localStorage.setItem(
        journalStorageKeyForUser(userId),
        JSON.stringify(nextEntries),
      );
      window.dispatchEvent(new Event(JOURNAL_UPDATED_EVENT));
      setStorageError('');
    } catch (error) {
      setStorageError(`Journal data synced, but could not be cached locally: ${messageFrom(error)}`);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadEntries() {
      try {
        const userId = getApiCacheUser();
        if (!userId) throw new Error('Your account could not be verified.');

        let loadedEntries = await fetchJournalEntries();
        const migrationKey = `${JOURNAL_MIGRATION_KEY_PREFIX}${userId}`;
        if (window.localStorage.getItem(migrationKey) !== '1') {
          const legacyData = window.localStorage.getItem(JOURNAL_STORAGE_KEY);
          if (legacyData !== null) {
            const legacyEntries = readJournalEntries(JOURNAL_STORAGE_KEY).filter(
              (entry) => !entry.id.startsWith('example-'),
            );

            for (const legacyEntry of legacyEntries) {
              const alreadySynced = loadedEntries.some(
                (entry) =>
                  entry.title === legacyEntry.title &&
                  entry.body === legacyEntry.body &&
                  entry.date === legacyEntry.date &&
                  entry.time === legacyEntry.time,
              );
              if (!alreadySynced) {
                loadedEntries = [
                  await createJournalEntryRequest(legacyEntry),
                  ...loadedEntries,
                ];
              }
            }
          }

          window.localStorage.setItem(migrationKey, '1');
          if (legacyData !== null) {
            window.localStorage.removeItem(JOURNAL_STORAGE_KEY);
          }
        }

        loadedEntries.sort(
          (left, right) =>
            Date.parse(`${right.date}T${right.time}`) -
            Date.parse(`${left.date}T${left.time}`),
        );
        if (!active) return;
        setEntries(loadedEntries);
        persistEntries(loadedEntries);
      } catch (error) {
        if (active) {
          setStorageError(`Journal entries could not be loaded: ${messageFrom(error)}`);
        }
      } finally {
        if (active) setIsReady(true);
      }
    }

    void loadEntries();
    return () => {
      active = false;
    };
  }, [persistEntries]);

  const createEntry = useCallback(
    async (input: JournalEntryInput) => {
      setIsSaving(true);
      setStorageError('');
      try {
        const created = await createJournalEntryRequest({
          ...input,
          isPinned: input.isPinned ?? false,
        });
        const nextEntries = [created, ...entries];
        setEntries(nextEntries);
        persistEntries(nextEntries);
        return created;
      } catch (error) {
        setStorageError(`Journal entry could not be saved: ${messageFrom(error)}`);
        return undefined;
      } finally {
        setIsSaving(false);
      }
    },
    [entries, persistEntries],
  );

  const updateEntry = useCallback(
    async (id: string, input: JournalEntryInput) => {
      setIsSaving(true);
      setStorageError('');
      try {
        const currentEntry = entries.find((entry) => entry.id === id);
        const updated = await updateJournalEntryRequest(id, {
          ...input,
          isPinned: input.isPinned ?? currentEntry?.isPinned ?? false,
        });
        const nextEntries = entries.map((entry) =>
          entry.id === id ? updated : entry,
        );
        setEntries(nextEntries);
        persistEntries(nextEntries);
        return updated;
      } catch (error) {
        setStorageError(`Journal entry could not be updated: ${messageFrom(error)}`);
        return undefined;
      } finally {
        setIsSaving(false);
      }
    },
    [entries, persistEntries],
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      setIsSaving(true);
      setStorageError('');
      try {
        await deleteJournalEntryRequest(id);
        const nextEntries = entries.filter((entry) => entry.id !== id);
        setEntries(nextEntries);
        persistEntries(nextEntries);
        return true;
      } catch (error) {
        setStorageError(`Journal entry could not be deleted: ${messageFrom(error)}`);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [entries, persistEntries],
  );

  const togglePinned = useCallback(
    async (id: string) => {
      const entry = entries.find((item) => item.id === id);
      if (!entry) return undefined;
      return updateEntry(id, {
        title: entry.title,
        body: entry.body,
        date: entry.date,
        time: entry.time,
        kind: entry.kind,
        tags: entry.tags,
        related: entry.related,
        prompt: entry.prompt,
        isPinned: !entry.isPinned,
      });
    },
    [entries, updateEntry],
  );

  return {
    entries,
    isReady,
    isSaving,
    storageError,
    createEntry,
    updateEntry,
    deleteEntry,
    togglePinned,
  };
}
