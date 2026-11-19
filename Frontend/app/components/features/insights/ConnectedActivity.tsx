import { ArrowRight, BookOpen, NotebookPen, Waypoints } from 'lucide-react';
import { Link } from 'react-router';
import type { GrowthActivitySnapshot } from '../activity/types';

interface ConnectedActivityProps {
  data: GrowthActivitySnapshot;
}

export default function ConnectedActivity({ data }: ConnectedActivityProps) {
  const resource =
    data.resources.find(
      (item) =>
        data.journalEntries.some((entry) =>
          entry.related.some(
            (related) => related.kind === 'resource' && related.id === item._id,
          ),
        ) ||
        data.notes.some(
          (note) =>
            note.resource &&
            typeof note.resource === 'object' &&
            note.resource._id === item._id,
        ),
    ) ?? data.resources[0];

  const linkedEntries = resource
    ? data.journalEntries.filter((entry) =>
        entry.related.some(
          (related) =>
            related.kind === 'resource' && related.id === resource._id,
        ),
      ).length
    : data.journalEntries.length;
  const linkedNotes = resource
    ? data.notes.filter(
        (note) =>
          note.resource &&
          typeof note.resource === 'object' &&
          note.resource._id === resource._id,
      ).length
    : data.notes.length;
  const hasConnections = linkedEntries > 0 || linkedNotes > 0;

  return (
    <section className="insight-connected-activity" aria-labelledby="insight-connected-title">
      <div className="insight-connected-activity__copy">
        <p>CONNECTED ACTIVITY</p>
        <h2 id="insight-connected-title">
          {hasConnections
            ? 'Learning became more useful when it had somewhere to go.'
            : 'Your activity is building a connected record.'}
        </h2>
        <div className="insight-connection-chain">
          {resource ? (
            <Link
              to={`/library?resource=${encodeURIComponent(resource._id)}`}
              className="insight-connection-chip"
            >
              <BookOpen size={14} aria-hidden="true" />
              {resource.title}
            </Link>
          ) : (
            <Link to="/library" className="insight-connection-chip">
              <BookOpen size={14} aria-hidden="true" />
              {data.resources.length} resources
            </Link>
          )}
          <span className="insight-connection-line" aria-hidden="true" />
          <Link to="/journal" className="insight-connection-chip">
            <NotebookPen size={14} aria-hidden="true" />
            {linkedEntries} {linkedEntries === 1 ? 'reflection' : 'reflections'}
          </Link>
          <span className="insight-connection-line" aria-hidden="true" />
          <Link to="/library?tab=notes" className="insight-connection-chip">
            {linkedNotes} {linkedNotes === 1 ? 'linked note' : 'linked notes'}
          </Link>
        </div>
        <Link to="/timeline" className="insight-connected-link">
          Explore the connected timeline
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
      <Waypoints
        className="insight-connected-watermark"
        size={112}
        strokeWidth={0.75}
        aria-hidden="true"
      />
    </section>
  );
}
