import { useState } from 'react';
import { Icon } from '~/components/ui/Icon';

export default function DailyIntention() {
  const [intention, setIntention] = useState(
    'Leave enough room to notice what is working.',
  );
  const [draft, setDraft] = useState(intention);
  const [editing, setEditing] = useState(false);

  const saveIntention = () => {
    const next = draft.trim();
    if (!next) return;
    setIntention(next);
    setEditing(false);
  };

  return (
    <section className="today-intention" aria-labelledby="today-intention-title">
      <div className="today-section-heading">
        <span>[01]</span>
        <h2 id="today-intention-title">DAILY INTENTION</h2>
      </div>

      {editing ? (
        <div className="today-intention__editor">
          <textarea
            autoFocus
            aria-label="Edit daily intention"
            maxLength={180}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setEditing(false);
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                saveIntention();
              }
            }}
          />
          <button type="button" onClick={saveIntention}>
            SAVE
          </button>
        </div>
      ) : (
        <div className="today-intention__quote-row">
          <p>&ldquo;{intention}&rdquo;</p>
          <button
            type="button"
            aria-label="Edit daily intention"
            onClick={() => {
              setDraft(intention);
              setEditing(true);
            }}
          >
            <Icon name="edit" size={16} />
          </button>
        </div>
      )}
    </section>
  );
}
