import { ArrowUpRight, BookOpen, Check, Flag, NotebookPen, X } from 'lucide-react';
import { Link } from 'react-router';
import ModalLayer from '~/components/common/ModalLayer';
import type { TimelineEvent } from './types';
import { getTimelineTypeLabel } from './timelineData';

interface TimelineEventDrawerProps {
  event: TimelineEvent;
  onClose: () => void;
}

function EventIcon({ type }: Pick<TimelineEvent, 'type'>) {
  const common = { size: 18, strokeWidth: 1.7 };
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

export default function TimelineEventDrawer({
  event,
  onClose,
}: TimelineEventDrawerProps) {
  const date = new Date(event.occurredAt);
  const formattedDate = date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const time = date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <ModalLayer
      className="timeline-drawer-layer"
      onClose={onClose}
    >
      <aside
        className="timeline-event-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="timeline-drawer-title"
      >
        <header className="timeline-drawer-header">
          <span>EVENT DETAIL · {getTimelineTypeLabel(event.type)}</span>
          <button
            type="button"
            className="timeline-drawer-close"
            onClick={onClose}
            aria-label="Close event details"
          >
            <X size={18} />
          </button>
        </header>
        <div className={`timeline-drawer-icon type-${event.type}`}>
          <EventIcon type={event.type} />
        </div>
        <p className="timeline-drawer-type">{getTimelineTypeLabel(event.type)}</p>
        <h2 id="timeline-drawer-title">{event.title}</h2>
        <p className="timeline-drawer-description">{event.description}</p>
        <div className="timeline-drawer-date">
          <span>{formattedDate}</span>
          <time dateTime={event.occurredAt}>{time}</time>
        </div>
        <section className="timeline-drawer-source">
          <h3>SOURCE OBJECT</h3>
          <Link
            to={event.sourceHref}
            className="timeline-source-link"
            onClick={onClose}
          >
            <span className="timeline-source-link-icon">
              <ArrowUpRight size={17} />
            </span>
            <span>
              <strong>Open original source</strong>
              <small>{event.sourceTitle}</small>
            </span>
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </section>
        <div className="timeline-drawer-note">
          <span aria-hidden="true">i</span>
          <p>
            This event stays connected to its source, so your history remains
            easy to trace.
          </p>
        </div>
        {event.isSample && (
          <p className="timeline-drawer-sample-note">
            This is locally displayed sample activity.
          </p>
        )}
      </aside>
    </ModalLayer>
  );
}
