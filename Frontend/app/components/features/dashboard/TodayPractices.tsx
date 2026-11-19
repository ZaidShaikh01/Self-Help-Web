import { Icon, type IconName } from '~/components/ui/Icon';
import { Link } from 'react-router';

export interface TodayPractice {
  id: string;
  title: string;
  detail: string;
  duration: string;
  icon: IconName;
  completed: boolean;
}

interface TodayPracticesProps {
  practices: TodayPractice[];
  onToggle: (id: string) => void;
  isLoading?: boolean;
  error?: string;
  notice?: string;
  updatingId?: string | null;
  onRetry?: () => void;
}

export default function TodayPractices({
  practices,
  onToggle,
  isLoading = false,
  error = '',
  notice = '',
  updatingId = null,
  onRetry,
}: TodayPracticesProps) {
  const completed = practices.filter((practice) => practice.completed).length;

  return (
    <section className="today-practices" aria-labelledby="today-practices-title">
      <div className="today-practices__heading">
        <div className="today-section-heading">
          <span>[02]</span>
          <h2 id="today-practices-title">TODAY&apos;S PRACTICES</h2>
        </div>
        <p>
          {completed} of {practices.length} complete
        </p>
      </div>

      {error && (
        <div className="today-practice-message is-error" role="alert">
          <span>{error}</span>
          {onRetry && (
            <button type="button" onClick={onRetry}>
              Retry
            </button>
          )}
        </div>
      )}
      {notice && !error && (
        <p className="today-practice-message" role="status">{notice}</p>
      )}

      {isLoading && practices.length === 0 ? (
        <p className="today-practice-empty" role="status">Loading today&apos;s practices…</p>
      ) : practices.length === 0 ? (
        <div className="today-practice-empty">
          <span>No habits are scheduled for today.</span>
          <Link to="/habits">Review your habits</Link>
        </div>
      ) : (
        <div className="today-practice-list">
          {practices.map((practice, index) => (
            <article className="today-practice" key={practice.id}>
              <span className="today-practice__icon" aria-hidden="true">
                <Icon name={practice.icon} size={19} />
              </span>
              <div className="today-practice__copy">
                <h3>{practice.title}</h3>
                <p>{practice.detail}</p>
              </div>
              <span className="today-practice__duration">{practice.duration}</span>
              <button
                type="button"
                disabled={updatingId === practice.id}
                aria-pressed={practice.completed}
                aria-label={`${practice.completed ? 'Mark incomplete' : 'Mark complete'}: ${practice.title}`}
                className={`today-practice__action${practice.completed ? ' is-complete' : ''}`}
                onClick={() => onToggle(practice.id)}
              >
                <Icon name={practice.completed ? 'check' : 'plus'} size={14} />
                {updatingId === practice.id
                  ? 'SAVING'
                  : practice.completed
                    ? 'DONE'
                    : 'MARK DONE'}
              </button>
              <span className="sr-only">Practice {index + 1} of {practices.length}</span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
