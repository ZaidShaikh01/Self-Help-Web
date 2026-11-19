import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Search, X } from 'lucide-react';
import { useLocation } from 'react-router';
import { toLocalDateInput } from '~/components/features/journal/journalUtils';
import {
  getActivityDate,
  totalActivity,
} from '../activity/activityMath';
import useGrowthActivity from '../activity/useGrowthActivity';
import TimelineActivityChart from './TimelineActivityChart';
import TimelineEventDrawer from './TimelineEventDrawer';
import TimelineEventRow from './TimelineEventRow';
import type {
  TimelineEvent,
  TimelineEventGroup,
  TimelineFilter,
} from './types';
import { getTimelineTypeLabel } from './timelineData';

const FILTERS: Array<{ id: TimelineFilter; label: string }> = [
  { id: 'all', label: 'All events' },
  { id: 'habit', label: 'Habits' },
  { id: 'journal', label: 'Journal' },
  { id: 'resource', label: 'Library' },
  { id: 'milestone', label: 'Milestones' },
];

function groupByDay(events: TimelineEvent[]): TimelineEventGroup[] {
  const today = toLocalDateInput(new Date());
  const groups = new Map<string, TimelineEvent[]>();

  for (const event of events) {
    const date = toLocalDateInput(new Date(event.occurredAt));
    const group = groups.get(date) ?? [];
    group.push(event);
    groups.set(date, group);
  }

  return Array.from(groups.entries())
    .sort(([left], [right]) => right.localeCompare(left))
    .map(([date, groupedEvents]) => {
      const dateValue = new Date(`${date}T12:00:00`);
      const dateLabel = dateValue.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
      return {
        date,
        title: date === today ? `Today · ${dateLabel}` : dateLabel,
        events: groupedEvents.sort(
          (left, right) =>
            Date.parse(right.occurredAt) - Date.parse(left.occurredAt),
        ),
      };
    });
}

export default function TimelinePage() {
  const location = useLocation();
  const { data, isLoading, error, reload } = useGrowthActivity();
  const events = data?.events ?? [];
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<TimelineFilter>('all');
  const [selectedDate, setSelectedDate] = useState(
    () => new URLSearchParams(location.search).get('date') ?? '',
  );
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState<TimelineEvent | null>(null);

  useEffect(() => {
    const date = new URLSearchParams(location.search).get('date') ?? '';
    setSelectedDate(date);
  }, [location.search]);

  const matchingEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return events.filter((event) => {
      const matchesFilter = filter === 'all' || event.type === filter;
      const matchesQuery =
        !normalizedQuery ||
        `${event.title} ${event.description} ${event.sourceTitle} ${getTimelineTypeLabel(event.type)}`
          .toLocaleLowerCase()
          .includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });
  }, [events, filter, query]);

  const displayedEvents = useMemo(
    () =>
      selectedDate
        ? matchingEvents.filter(
            (event) => getActivityDate(event.occurredAt) === selectedDate,
          )
        : matchingEvents,
    [matchingEvents, selectedDate],
  );
  const groups = useMemo(() => groupByDay(displayedEvents), [displayedEvents]);

  if (isLoading) {
    return (
      <div className="timeline-page timeline-loading" role="status">
        <span className="timeline-loading-line" />
        <span className="timeline-loading-line" />
        <span className="timeline-loading-line" />
        <span className="sr-only">Loading your timeline</span>
      </div>
    );
  }

  return (
    <div className="timeline-page">
      <header className="timeline-page-header">
        <div>
          <p className="timeline-eyebrow">YOUR PERSONAL HISTORY</p>
          <h1>Your life, in context.</h1>
          <p className="timeline-page-subtitle">
            Small actions. Meaningful patterns. A history you can return to.
          </p>
        </div>
        <div className="timeline-jump-wrap">
          {datePickerOpen ? (
            <label className="timeline-date-picker">
              <CalendarDays size={15} aria-hidden="true" />
              <span className="sr-only">Jump to date</span>
              <input
                type="date"
                aria-label="Jump to date"
                value={selectedDate || toLocalDateInput(new Date())}
                onChange={(event) => setSelectedDate(event.target.value)}
              />
              <button
                type="button"
                onClick={() => setDatePickerOpen(false)}
                aria-label="Close date picker"
              >
                <X size={14} />
              </button>
            </label>
          ) : (
            <button
              type="button"
              className="timeline-jump-button"
              onClick={() => setDatePickerOpen(true)}
            >
              <CalendarDays size={15} />
              Jump to date
            </button>
          )}
        </div>
      </header>

      <section className="timeline-plot" aria-labelledby="timeline-plot-title">
        <div className="timeline-plot-copy">
          <p className="timeline-plot-kicker">ACTIVITY / LAST 7 DAYS</p>
          <h2 id="timeline-plot-title">Small steps. A visible rhythm.</h2>
          <p>
            Each point is a day in your history. The wave rises as meaningful
            actions add up.
          </p>
          <span className="timeline-plot-caption">
            <span aria-hidden="true" />
            {totalActivity(matchingEvents)}{' '}
            {totalActivity(matchingEvents) === 1 ? 'event' : 'events'} in view
          </span>
        </div>
        <TimelineActivityChart
          events={matchingEvents}
          selectedDate={selectedDate}
          onSelectDate={(date) =>
            setSelectedDate((current) => (current === date ? '' : date))
          }
        />
      </section>

      <section className="timeline-controls" aria-label="Filter timeline">
        <label className="timeline-search">
          <Search size={15} aria-hidden="true" />
          <span className="sr-only">Search timeline events</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search timeline"
            aria-label="Search timeline events"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear timeline search"
            >
              <X size={14} />
            </button>
          )}
        </label>
        <div className="timeline-filters" role="group" aria-label="Event type">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={filter === item.id ? 'is-active' : ''}
              aria-pressed={filter === item.id}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {error && (
        <div className="timeline-storage-error" role="alert">
          <span>Timeline activity could not be loaded: {error}</span>
          <button type="button" onClick={reload}>Retry</button>
        </div>
      )}

      <section className="timeline-content">
        <div className="timeline-feed">
          <div className="timeline-feed-heading">
            <div>
              <h2>{selectedDate ? 'Selected day' : 'Recent activity'}</h2>
              {selectedDate && (
                <p>
                  {new Date(`${selectedDate}T12:00:00`).toLocaleDateString(
                    undefined,
                    { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
                  )}
                  <button
                    type="button"
                    className="timeline-clear-day"
                    onClick={() => setSelectedDate('')}
                  >
                    Clear day
                  </button>
                </p>
              )}
            </div>
            <span>
              {totalActivity(displayedEvents)}{' '}
              {totalActivity(displayedEvents) === 1 ? 'event' : 'events'}
            </span>
          </div>

          {groups.length > 0 ? (
            groups.map((group) => (
              <section className="timeline-day-group" key={group.date}>
                <div className="timeline-day-heading">
                  <h3>{group.title}</h3>
                  <span>
                    {totalActivity(group.events)}{' '}
                    {totalActivity(group.events) === 1 ? 'event' : 'events'}
                  </span>
                </div>
                <div className="timeline-day-events">
                  {group.events.map((event) => (
                    <TimelineEventRow
                      key={event.id}
                      event={event}
                      onSelect={setActiveEvent}
                    />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="timeline-empty-state">
              <span>NO MATCHING EVENTS</span>
              <h3>No activity on this part of the timeline.</h3>
              <p>Try another date or clear the search and category filters.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedDate('');
                  setFilter('all');
                  setQuery('');
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        <aside className="timeline-aside">
          <section className="timeline-aside-card">
            <p className="timeline-aside-kicker">HOW THIS WORKS</p>
            <h2>Your progress, with its source attached.</h2>
            <p>
              Timeline events come from meaningful actions. Open an event to
              return to the habit, journal entry, or resource it belongs to.
            </p>
            <ul className="timeline-legend">
              {FILTERS.slice(1).map((item) => (
                <li key={item.id}>
                  <span className={`timeline-legend-dot type-${item.id}`} />
                  {item.label}
                </li>
              ))}
            </ul>
            <p className="timeline-local-note">
              Habit and library activity comes from your saved records. Journal
              activity is stored in this browser.
            </p>
          </section>
        </aside>
      </section>

      {activeEvent && (
        <TimelineEventDrawer
          event={activeEvent}
          onClose={() => setActiveEvent(null)}
        />
      )}
    </div>
  );
}
