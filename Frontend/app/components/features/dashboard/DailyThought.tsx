import { Button } from '~/components/ui/Button';

interface DailyThoughtProps {
  quote: string;
  author: string;
  onNewQuote?: () => void;
}

export default function DailyThought({
  quote,
  author,
  onNewQuote,
}: DailyThoughtProps) {
  return (
    <section className="dashboard-hero flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <p className="eyebrow">Daily Thought</p>
        <p className="quote-text">"{quote}"</p>
        <p className="quote-author">— {author}</p>
      </div>

      {onNewQuote && (
        <Button variant="secondary" type="button" onClick={onNewQuote}>
          New quote
        </Button>
      )}
    </section>
  );
}
