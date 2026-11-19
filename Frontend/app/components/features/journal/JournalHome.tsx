import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Icon } from '~/components/ui/Icon';
import type { JournalEntry } from './types';
import JournalEntryCard from './JournalEntryCard';
import JournalPromptCard from './JournalPromptCard';
import {
  dateFromInput,
  formatDay,
  monthKey,
  monthLabel,
} from './journalUtils';

const PROMPTS = [
  'What felt a little easier today?',
  'What would you like to remember from this week?',
  'What did you notice when you slowed down?',
  'Which small action helped you feel more like yourself?',
  'What are you learning to make room for?',
  'What is one thing you want to carry into tomorrow?',
  'What mattered more than you expected today?',
];

interface JournalHomeProps {
  entries: JournalEntry[];
  storageError: string;
}

export default function JournalHome({
  entries,
  storageError,
}: JournalHomeProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const selectedDate = new URLSearchParams(location.search).get('date') ?? '';
  const hasSelectedDate = /^\d{4}-\d{2}-\d{2}$/.test(selectedDate);
  const [month, setMonth] = useState(() => {
    const now = hasSelectedDate ? dateFromInput(selectedDate) : new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState(
    hasSelectedDate ? selectedDate : '',
  );

  const prompt = PROMPTS[new Date().getDate() % PROMPTS.length];
  const monthEntries = useMemo(
    () =>
      entries
        .filter(
          (entry) =>
            monthKey(entry.date) ===
            `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`,
        )
        .sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`)),
    [entries, month],
  );
  const days = [...new Set(monthEntries.map((entry) => entry.date))];
  const normalizedQuery = query.trim().toLowerCase();
  const filteredEntries = monthEntries.filter((entry) => {
    const matchesDay = !selectedDay || entry.date === selectedDay;
    const searchable = [
      entry.title,
      entry.body,
      entry.kind,
      ...entry.tags,
      ...entry.related.map((related) => related.title),
    ]
      .join(' ')
      .toLowerCase();
    return matchesDay && (!normalizedQuery || searchable.includes(normalizedQuery));
  });

  function changeMonth(amount: number) {
    setMonth((current) =>
      new Date(current.getFullYear(), current.getMonth() + amount, 1),
    );
    setSelectedDay('');
  }

  function startFromPrompt() {
    navigate(`/journal/new?prompt=${encodeURIComponent(prompt)}`);
  }

  return (
    <div className="journal-page route-enter">
      <header className="journal-header">
        <div>
          <p className="journal-eyebrow">A place to notice</p>
          <h1>Journal</h1>
          <p className="journal-subtitle">
            Keep the thoughts that help you understand your days.
          </p>
        </div>
        <button
          type="button"
          className="journal-primary-button"
          onClick={() => navigate('/journal/new')}
        >
          <Icon name="edit" size={14} />
          New entry
        </button>
      </header>

      {storageError && (
        <p className="journal-storage-alert" role="alert">
          {storageError} Your entries remain available in this session.
        </p>
      )}

      <div className="journal-toolbar">
        <label className="journal-search">
          <Icon name="search" size={15} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search reflections"
            aria-label="Search journal entries"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              <Icon name="close" size={14} />
            </button>
          )}
        </label>

        <div className="journal-month-control" aria-label="Choose month">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label="Previous month"
          >
            <Icon name="chevron" size={15} className="journal-chevron-left" />
          </button>
          <span>{monthLabel(month)}</span>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            aria-label="Next month"
          >
            <Icon name="chevron" size={15} />
          </button>
        </div>
      </div>

      <JournalPromptCard prompt={prompt} onWrite={startFromPrompt} />

      <section className="journal-entries" aria-labelledby="journal-entries-title">
        <div className="journal-section-heading">
          <h2 id="journal-entries-title">Recent entries</h2>
          <span>
            {filteredEntries.length}{' '}
            {filteredEntries.length === 1 ? 'reflection' : 'reflections'}
          </span>
        </div>

        {days.length > 0 && (
          <div className="journal-day-filter" aria-label="Filter by day">
            <button
              type="button"
              className={!selectedDay ? 'is-selected' : ''}
              aria-pressed={!selectedDay}
              onClick={() => setSelectedDay('')}
            >
              All days
            </button>
            {days.map((day) => (
              <button
                type="button"
                key={day}
                className={selectedDay === day ? 'is-selected' : ''}
                aria-pressed={selectedDay === day}
                onClick={() => setSelectedDay(day)}
                title={formatDay(day)}
              >
                {new Date(`${day}T12:00:00`).getDate()}
              </button>
            ))}
          </div>
        )}

        {filteredEntries.length > 0 ? (
          <div className="journal-entry-list">
            {filteredEntries.map((entry) => (
              <JournalEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="journal-empty-state">
            <span className="journal-empty-index">NO ENTRIES / 00</span>
            <h3>
              {normalizedQuery
                ? 'No entries match this search.'
                : selectedDay
                  ? 'Nothing recorded for this day.'
                  : 'A blank page is a good place to begin.'}
            </h3>
            <p>
              {normalizedQuery
                ? 'Try another word or clear your search.'
                : 'Write a thought, capture a question, or start with today’s prompt.'}
            </p>
            {!normalizedQuery && (
              <button
                type="button"
                className="journal-primary-button"
                onClick={() =>
                  navigate(
                    `/journal/new${selectedDay ? `?date=${selectedDay}` : ''}`,
                  )
                }
              >
                <Icon name="edit" size={14} />
                Write an entry
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
