interface WeeklyFieldNoteProps {
  completionRate: number;
  completedActions: number;
  scheduledActions: number;
  journalEntries: number;
  hasActivity: boolean;
  rangeLabel: string;
}

function getFieldNote(completionRate: number, hasActivity: boolean) {
  if (!hasActivity) {
    return 'Your history is ready for its first small signal.';
  }
  if (completionRate >= 75) {
    return 'Your practices found a rhythm worth returning to.';
  }
  if (completionRate >= 45) {
    return 'Your practices held a steady rhythm, with room to begin again.';
  }
  return 'Small actions are beginning to leave a trace.';
}

export default function WeeklyFieldNote({
  completionRate,
  completedActions,
  scheduledActions,
  journalEntries,
  hasActivity,
  rangeLabel,
}: WeeklyFieldNoteProps) {
  return (
    <section className="insight-field-note" aria-labelledby="insight-field-title">
      <svg
        className="insight-field-wave"
        viewBox="0 0 1200 220"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 166 C130 166 130 72 260 72 S390 184 520 132 650 34 780 79 910 185 1040 126 1135 77 1200 80" />
        <path d="M0 190 C155 190 155 108 300 108 S455 202 600 154 745 62 890 101 1035 197 1200 136" />
      </svg>
      <div className="insight-field-note__meta">
        <span>WEEKLY FIELD NOTE · {rangeLabel}</span>
        <span>{journalEntries} journal {journalEntries === 1 ? 'entry' : 'entries'}</span>
      </div>
      <h2 id="insight-field-title">
        {getFieldNote(completionRate, hasActivity)}
      </h2>
      <p className="insight-field-note__disclaimer">
        These observations describe recorded activity. They do not infer causes
        or judge missed days.
      </p>
      <div className="insight-field-note__footer">
        <span>
          {completedActions} / {scheduledActions} scheduled actions recorded
        </span>
        <span className="insight-field-note__signal" aria-hidden="true" />
      </div>
    </section>
  );
}
