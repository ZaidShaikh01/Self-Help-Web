import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { countActivityByDate } from '../activity/activityMath';
import useGrowthActivity from '../activity/useGrowthActivity';
import ConnectedActivity from './ConnectedActivity';
import ContributionHeatmap from './ContributionHeatmap';
import HabitActivityChart from './HabitActivityChart';
import InsightMetricCard from './InsightMetricCard';
import InsightPeriodControl from './InsightPeriodControl';
import ResourceStatusChart from './ResourceStatusChart';
import WeeklyFieldNote from './WeeklyFieldNote';
import WritingRhythmChart from './WritingRhythmChart';
import {
  getInsightRangeData,
  type InsightRange,
} from './insightsData';
import { toLocalDateInput } from '~/components/features/journal/journalUtils';

function compareCount(current: number, previous: number) {
  const difference = current - previous;
  if (difference === 0) return 'Same as the prior period';
  return `${difference > 0 ? '+' : ''}${difference} vs prior period`;
}

function getLastEightWeekEntries<T extends { createdAt: string }>(entries: T[]) {
  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - 55);
  const fromKey = toLocalDateInput(from);
  return entries.filter(
    (entry) => toLocalDateInput(new Date(entry.createdAt)) >= fromKey,
  );
}

export default function InsightsPage() {
  const { data, isLoading, error, reload } = useGrowthActivity();
  const [range, setRange] = useState<InsightRange>(7);
  const [selectedDate, setSelectedDate] = useState(() =>
    toLocalDateInput(new Date()),
  );

  const rangeData = useMemo(
    () => (data ? getInsightRangeData(data, range) : null),
    [data, range],
  );
  const activityByDate = useMemo(
    () => countActivityByDate(data?.events ?? []),
    [data],
  );
  const selectedActivity = activityByDate.get(selectedDate) ?? 0;
  const writingEntries = data
    ? getLastEightWeekEntries(data.journalEntries)
    : [];
  const isComparable = range < 90;

  if (isLoading) {
    return (
      <div className="insights-page insights-loading" role="status">
        <span className="insights-loading-line" />
        <span className="insights-loading-line" />
        <span className="insights-loading-line" />
        <span className="sr-only">Loading insights</span>
      </div>
    );
  }

  if (error || !data || !rangeData) {
    return (
      <div className="insights-page insights-error" role="alert">
        <p>INSIGHTS ARE TEMPORARILY UNAVAILABLE</p>
        <h1>Your activity could not be loaded.</h1>
        <span>{error || 'No activity data is available yet.'}</span>
        <button type="button" onClick={reload}>Retry</button>
      </div>
    );
  }

  const inProgressResources = data.resources.filter(
    (resource) => resource.status === 'In Progress',
  ).length;

  return (
    <div className="insights-page">
      <header className="insights-header">
        <div>
          <p>GROWTH OS / PERSONAL ANALYTICS</p>
          <h1>Insights</h1>
          <span>Notice the patterns behind your progress.</span>
        </div>
        <InsightPeriodControl
          value={range}
          rangeLabel={rangeData.rangeLabel}
          onChange={setRange}
        />
      </header>

      <WeeklyFieldNote
        completionRate={rangeData.completionRate}
        completedActions={rangeData.completedActions}
        scheduledActions={rangeData.scheduledActions}
        journalEntries={rangeData.journalEntries}
        hasActivity={rangeData.timelineEvents > 0}
        rangeLabel={rangeData.rangeLabel}
      />

      <section className="insight-metrics" aria-label="Period summary">
        <InsightMetricCard
          index={0}
          label="Habit completion"
          value={`${rangeData.completionRate}%`}
          detail={`${rangeData.completedActions} of ${rangeData.scheduledActions} scheduled actions`}
          comparison={
            isComparable
              ? `${rangeData.completionRate - rangeData.previousCompletionRate > 0 ? '+' : ''}${rangeData.completionRate - rangeData.previousCompletionRate} pts vs prior period`
              : 'Based on recorded practice'
          }
          href="/habits"
        />
        <InsightMetricCard
          index={1}
          label="Journal entries"
          value={String(rangeData.journalEntries)}
          detail={`Across ${rangeData.journalDays} different ${rangeData.journalDays === 1 ? 'day' : 'days'}`}
          comparison={
            isComparable
              ? compareCount(
                  rangeData.journalEntries,
                  rangeData.previousJournalEntries,
                )
              : 'Saved in this browser'
          }
          href="/journal"
        />
        <InsightMetricCard
          index={2}
          label="Learning activity"
          value={String(rangeData.learningActivity)}
          detail={`${inProgressResources} currently in progress`}
          comparison={
            isComparable
              ? compareCount(
                  rangeData.learningActivity,
                  rangeData.previousLearningActivity,
                )
              : `${data.notes.length} library notes`
          }
          href="/library"
        />
        <InsightMetricCard
          index={3}
          label="Timeline events"
          value={String(rangeData.timelineEvents)}
          detail={`${rangeData.activeDays} ${rangeData.activeDays === 1 ? 'active day' : 'active days'} recorded`}
          comparison={
            isComparable
              ? compareCount(
                  rangeData.timelineEvents,
                  rangeData.previousTimelineEvents,
                )
              : 'Across the selected range'
          }
          href="/timeline"
        />
      </section>

      <ContributionHeatmap
        events={data.events}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      <HabitActivityChart
        days={rangeData.habitDays}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        selectedCount={selectedActivity}
      />

      <div className="insight-chart-grid">
        <ResourceStatusChart resources={data.resources} />
        <WritingRhythmChart
          entries={writingEntries}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </div>

      <ConnectedActivity data={data} />

      <footer className="insights-footer">
        <span>
          Data from habits and library records, plus Journal entries stored in
          this browser. Insights describe recorded activity, not causes.
        </span>
        <Link to="/timeline">Open timeline</Link>
      </footer>
    </div>
  );
}
