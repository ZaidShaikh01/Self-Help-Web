import { useCallback, useEffect, useState } from 'react';
import { loadGrowthActivity } from './growthActivity';
import {
  JOURNAL_UPDATED_EVENT,
  journalStorageKeyForUser,
} from '~/components/features/journal/journalStorage';
import { getApiCacheUser } from '~/lib/api';
import type { GrowthActivitySnapshot } from './types';

export default function useGrowthActivity() {
  const [data, setData] = useState<GrowthActivitySnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestNumber, setRequestNumber] = useState(0);

  const reload = useCallback(() => {
    setRequestNumber((current) => current + 1);
  }, []);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError('');

    loadGrowthActivity()
      .then((snapshot) => {
        if (active) setData(snapshot);
      })
      .catch((caught: unknown) => {
        if (!active) return;
        setData(null);
        setError(
          caught instanceof Error
            ? caught.message
            : 'Growth activity could not be loaded.',
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [requestNumber]);

  useEffect(() => {
    const handleFocus = () => reload();
    const handleJournalUpdate = () => reload();
    const handleStorage = (event: StorageEvent) => {
      const userId = getApiCacheUser();
      if (
        event.key === (userId ? journalStorageKeyForUser(userId) : null) ||
        event.key === null
      ) {
        reload();
      }
    };
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorage);
    window.addEventListener(JOURNAL_UPDATED_EVENT, handleJournalUpdate);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(JOURNAL_UPDATED_EVENT, handleJournalUpdate);
    };
  }, [reload]);

  return { data, isLoading, error, reload };
}
