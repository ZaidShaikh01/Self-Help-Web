import { useCallback, useEffect, useState } from 'react';
import type { JournalEntry, JournalEntryInput } from './types';
import {
  JOURNAL_STORAGE_KEY,
  JOURNAL_UPDATED_EVENT,
  readJournalEntries,
} from './journalStorage';
import { makeEntryId } from './journalUtils';

export default function useJournalEntries() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [canPersist, setCanPersist] = useState(false);
  const [storageError, setStorageError] = useState('');

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(JOURNAL_STORAGE_KEY);
      setEntries(readJournalEntries());
      setCanPersist(saved === null);
    } catch (error) {
      setEntries([]);
      setStorageError(
        error instanceof Error
          ? error.message
          : 'Journal entries could not be loaded from this browser.',
      );
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady || !canPersist) return;

    try {
      window.localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(entries));
      window.dispatchEvent(new Event(JOURNAL_UPDATED_EVENT));
      setStorageError('');
    } catch (error) {
      setStorageError(
        error instanceof Error
          ? `Journal changes could not be saved locally: ${error.message}`
          : 'Journal changes could not be saved locally.',
      );
    }
  }, [entries, isReady, canPersist]);

  const createEntry = useCallback((input: JournalEntryInput) => {
    const now = new Date().toISOString();
    const entry: JournalEntry = {
      ...input,
      id: makeEntryId(),
      createdAt: now,
      updatedAt: now,
    };
    setCanPersist(true);
    setEntries((current) => [entry, ...current]);
    return entry;
  }, []);

  const updateEntry = useCallback(
    (id: string, input: JournalEntryInput) => {
      const currentEntry = entries.find((entry) => entry.id === id);
      if (!currentEntry) return undefined;
      const updated = {
        ...currentEntry,
        ...input,
        updatedAt: new Date().toISOString(),
      };
      setCanPersist(true);
      setEntries((current) =>
        current.map((entry) => (entry.id === id ? updated : entry)),
      );
      return updated;
    },
    [entries],
  );

  const deleteEntry = useCallback((id: string) => {
    setCanPersist(true);
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }, []);

  return {
    entries,
    isReady,
    storageError,
    createEntry,
    updateEntry,
    deleteEntry,
  };
}
