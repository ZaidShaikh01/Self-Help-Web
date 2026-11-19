import { BookOpen, Check, Flag, NotebookPen, ChevronRight } from 'lucide-react';
import type { TimelineEvent } from './types';
import { getTimelineTypeLabel } from './timelineData';

interface TimelineEventRowProps {
  event: TimelineEvent;
  onSelect: (event: TimelineEvent) => void;
}

function EventIcon({ type }: Pick<TimelineEvent, 'type'>) {
  const common = { size: 15, strokeWidth: 1.7 };
  switch (type) {
    case 'habit':
      return <Check {...common} />;
    case 'journal':
      return <NotebookPen {...common} />;
    case 'resource':
      return <BookOpen {...common} />;
    case 'milestone':
      return <Flag {...common} />;
  }
}

export default function TimelineEventRow({
  event,
  onSelect,
}: TimelineEventRowProps) {
  const date = new Date(event.occurredAt);
  const time = date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <button
      type="button"
      className="timeline-event-row"
      onClick={() => onSelect(event)}
      aria-label={`Open ${getTimelineTypeLabel(event.type)}: ${event.title}`}
    >
      <time className="timeline-event-time" dateTime={event.occurredAt}>
        {time}
      </time>
      <span className={`timeline-event-marker type-${event.type}`} aria-hidden="true">
        <EventIcon type={event.type} />
      </span>
      <span className="timeline-event-content">
        <span className="timeline-event-kind">
          {getTimelineTypeLabel(event.type)}
          {event.isSample && <span className="timeline-sample-pill">SAMPLE</span>}
        </span>
        <span className="timeline-event-title">{event.title}</span>
        <span className="timeline-event-description">{event.description}</span>
        <span className="timeline-event-source">
          SOURCE · {event.sourceTitle}
        </span>
      </span>
      <ChevronRight className="timeline-event-chevron" size={17} aria-hidden="true" />
    </button>
  );
}
