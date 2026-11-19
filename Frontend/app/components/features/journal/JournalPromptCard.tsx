import { Icon } from '~/components/ui/Icon';

interface JournalPromptCardProps {
  prompt: string;
  onWrite: () => void;
}

export default function JournalPromptCard({
  prompt,
  onWrite,
}: JournalPromptCardProps) {
  return (
    <section className="journal-prompt" aria-labelledby="journal-prompt-title">
      <span className="journal-prompt-index" aria-hidden="true">
        P / 07
      </span>
      <div>
        <p>Today’s optional prompt</p>
        <h2 id="journal-prompt-title">{prompt}</h2>
      </div>
      <button type="button" className="journal-quiet-button" onClick={onWrite}>
        <Icon name="edit" size={14} />
        Write from prompt
      </button>
    </section>
  );
}
