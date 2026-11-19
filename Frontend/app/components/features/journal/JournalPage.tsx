import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import JournalEntryDetail from './JournalEntryDetail';
import JournalEntryEditor from './JournalEntryEditor';
import JournalHome from './JournalHome';
import useJournalEntries from './useJournalEntries';

function decodePathSegment(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default function JournalPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    entries,
    isReady,
    storageError,
    createEntry,
    updateEntry,
    deleteEntry,
  } = useJournalEntries();

  const segments = location.pathname.split('/').filter(Boolean);
  const entryId = segments.length > 1 ? decodePathSegment(segments[1]) : '';
  const entry = entries.find((item) => item.id === entryId);
  const isNewEntry = segments[1] === 'new' && segments.length === 2;
  const isEditing = segments[2] === 'edit' && segments.length === 3;
  const isEditor = isNewEntry || isEditing;
  const isJournalHome = segments.length === 1;
  const query = new URLSearchParams(location.search);

  useEffect(() => {
    if (!isReady || isJournalHome || isNewEntry) return;
    if (!entry || (segments.length > 2 && !isEditing)) {
      navigate('/journal', { replace: true });
    }
  }, [
    entry,
    isEditing,
    isJournalHome,
    isNewEntry,
    isReady,
    navigate,
    segments.length,
  ]);

  if (!isReady) {
    return (
      <div className="journal-page journal-loading" role="status">
        <span className="journal-loading-line" />
        <span className="journal-loading-line" />
        <span className="journal-loading-line" />
        <span className="sr-only">Loading journal entries</span>
      </div>
    );
  }

  if (isJournalHome) {
    return <JournalHome entries={entries} storageError={storageError} />;
  }

  if (isEditor) {
    if (isEditing && !entry) {
      return (
        <div className="journal-page journal-empty-state" role="status">
          This entry is no longer available.
        </div>
      );
    }

    return (
      <JournalEntryEditor
        key={entry?.id ?? 'new'}
        entry={entry}
        initialPrompt={isNewEntry ? query.get('prompt') ?? '' : ''}
        initialDate={isNewEntry ? query.get('date') ?? undefined : undefined}
        storageError={storageError}
        onCancel={() => navigate('/journal')}
        onSave={(input) => {
          const saved = entry
            ? updateEntry(entry.id, input)
            : createEntry(input);
          if (saved) {
            navigate(`/journal/${encodeURIComponent(saved.id)}`);
          }
        }}
      />
    );
  }

  if (!entry) {
    return (
      <div className="journal-page journal-empty-state" role="status">
        This entry is no longer available.
      </div>
    );
  }

  return (
    <JournalEntryDetail
      entry={entry}
      storageError={storageError}
      onDelete={(id) => {
        deleteEntry(id);
        navigate('/journal');
      }}
    />
  );
}
