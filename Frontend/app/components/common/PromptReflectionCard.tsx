import { useState, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';

interface PromptReflectionCardProps {
  category?: string;
  code?: string;
  title?: string;
  subtitle?: string;
  placeholder?: string;
  onSubmit?: (value: string) => void;
  className?: string;
}

/**
 * PromptReflectionCard - A reusable interactive card component featuring an orange border,
 * a reflection prompt question, subtitle, and an inline input field with a submit action.
 */
export default function PromptReflectionCard({
  category = "OPTIONAL REFLECTION",
  code = "085 / 07",
  title = "WHAT FELT A LITTLE EASIER TODAY?",
  subtitle = "Start with one sentence. You can always return later.",
  placeholder = "Begin writing...",
  onSubmit = () => {},
  className = "",
}: PromptReflectionCardProps) {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputValue.trim()) {
      onSubmit(inputValue);
      setInputValue("");
    }
  };

  return (
    <section className={`prompt-reflection-card ${className}`}>
      <div className="prompt-reflection-card__header">
        <span>{category}</span>
        <span>{code}</span>
      </div>

      <h2 className="prompt-reflection-card__title">
        {title}
      </h2>

      <p className="prompt-reflection-card__subtitle">{subtitle}</p>

      <form className="prompt-reflection-card__form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          aria-label="Today's reflection"
          className="prompt-reflection-card__input"
        />
        <button
          type="submit"
          aria-label="Submit reflection"
        >
          <ArrowRight size={18} />
        </button>
      </form>
    </section>
  );
}