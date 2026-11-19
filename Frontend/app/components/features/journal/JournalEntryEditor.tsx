import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Icon } from '~/components/ui/Icon';
import type {
  JournalEntry,
  JournalEntryInput,
  JournalEntryKind,
  JournalRelatedObject,
} from './types';
import { toLocalDateInput } from './journalUtils';

const KINDS: JournalEntryKind[] = [
  'Reflection',
  'Reading / practice',
  'Learning / study',
  'Weekly reflection',
];

interface JournalEntryEditorProps {
  entry?: JournalEntry;
  initialPrompt?: string;
  initialDate?: string;
  storageError: string;
  onCancel: () => void;
  onSave: (input: JournalEntryInput) => void;
}

function relatedObjects(value: string, kind: JournalRelatedObject['kind']) {
  return value
    .split(',')
    .map((title) => title.trim())
    .filter(Boolean)
    .map((title) => ({
      id: `${kind}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      title,
      kind,
    }));
}

export default function JournalEntryEditor({
  entry,
  initialPrompt = '',
  initialDate,
  storageError,
  onCancel,
  onSave,
}: JournalEntryEditorProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [title, setTitle] = useState(entry?.title ?? '');
  const [body, setBody] = useState(entry?.body ?? '');
  const [initialTime] = useState(
    () =>
      entry?.time ??
      new Date().toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
  );
  const [date, setDate] = useState(
    entry?.date ?? initialDate ?? toLocalDateInput(new Date()),
  );
  const [time, setTime] = useState(initialTime);
  const [kind, setKind] = useState<JournalEntryKind>(
    entry?.kind ?? 'Reflection',
  );
  const [tagsText, setTagsText] = useState(entry?.tags.join(', ') ?? '');
  const [habitsText, setHabitsText] = useState(
    entry?.related
      .filter((related) => related.kind === 'habit')
      .map((related) => related.title)
      .join(', ') ?? '',
  );
  const [resourcesText, setResourcesText] = useState(
    entry?.related
      .filter((related) => related.kind === 'resource')
      .map((related) => related.title)
      .join(', ') ?? '',
  );
  const [prompt, setPrompt] = useState(entry?.prompt ?? initialPrompt);
  const [formError, setFormError] = useState('');
  const initialValues = {
    title: entry?.title ?? '',
    body: entry?.body ?? '',
    date: entry?.date ?? initialDate ?? toLocalDateInput(new Date()),
    time: initialTime,
    kind: entry?.kind ?? 'Reflection',
    tagsText: entry?.tags.join(', ') ?? '',
    habitsText:
      entry?.related
        .filter((related) => related.kind === 'habit')
        .map((related) => related.title)
        .join(', ') ?? '',
    resourcesText:
      entry?.related
        .filter((related) => related.kind === 'resource')
        .map((related) => related.title)
        .join(', ') ?? '',
    prompt: entry?.prompt ?? initialPrompt,
  };
  const isDirty =
    title !== initialValues.title ||
    body !== initialValues.body ||
    date !== initialValues.date ||
    time !== initialValues.time ||
    kind !== initialValues.kind ||
    tagsText !== initialValues.tagsText ||
    habitsText !== initialValues.habitsText ||
    resourcesText !== initialValues.resourcesText ||
    prompt !== initialValues.prompt;

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        const form = bodyRef.current?.form;
        form?.requestSubmit();
      }
    }

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  function cancelEditing() {
    if (isDirty && !window.confirm('Discard your unsaved journal changes?')) {
      return;
    }
    onCancel();
  }

  function insertFormatting(open: string, close = open) {
    const textarea = bodyRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = body.slice(start, end);
    const content = selected || 'text';
    const next = `${body.slice(0, start)}${open}${content}${close}${body.slice(end)}`;
    setBody(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + open.length,
        start + open.length + content.length,
      );
    });
  }

  function insertLink() {
    const url = window.prompt('Enter a link URL (https://...)');
    if (!url) return;
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      setFormError('Enter a valid link that starts with https:// or http://.');
      return;
    }
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      setFormError('Only http and https links can be added.');
      return;
    }

    const textarea = bodyRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = body.slice(start, end) || 'link text';
    const markdown = `[${selected}](${parsedUrl.href})`;
    setBody(`${body.slice(0, start)}${markdown}${body.slice(end)}`);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 1, start + 1 + selected.length);
    });
    setFormError('');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setFormError('Give this moment a name before saving.');
      titleRef.current?.focus();
      return;
    }

    const tags = [
      ...new Set(
        tagsText
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      ),
    ];
    if (tags.length > 10) {
      setFormError('You can add up to 10 tags.');
      return;
    }

    const input: JournalEntryInput = {
      title: cleanTitle,
      body: body.trim(),
      date,
      time,
      kind,
      tags,
      related: [
        ...relatedObjects(habitsText, 'habit'),
        ...relatedObjects(resourcesText, 'resource'),
      ],
      prompt: prompt.trim() || undefined,
    };
    onSave(input);
  }

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
  const breadcrumb = entry ? 'Journal / Entry' : 'Journal / New entry';

  return (
    <div className="journal-page journal-editor-page route-enter">
      <header className="journal-editor-topbar">
        <button type="button" className="journal-back-link" onClick={cancelEditing}>
          <Icon name="arrow" size={14} className="journal-arrow-left" />
          Journal
        </button>
        <span className="journal-editor-status" role="status">
          <i />
          {isDirty ? 'Unsaved changes' : 'Ready'}
        </span>
        <button
          type="submit"
          form="journal-entry-form"
          className="journal-primary-button"
        >
          Save entry
        </button>
      </header>

      <p className="journal-breadcrumb" aria-label="Current page">
        <span>LOC</span> / {breadcrumb}
      </p>

      {(storageError || formError) && (
        <p className="journal-storage-alert" role="alert">
          {formError || storageError}
        </p>
      )}

      <form
        id="journal-entry-form"
        className="journal-editor-grid"
        onSubmit={handleSubmit}
      >
        <main className="journal-writing-area">
          <div className="journal-entry-datetime">
            <label>
              <span className="sr-only">Entry date</span>
              <input
                type="date"
                required
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </label>
            <span aria-hidden="true">·</span>
            <label>
              <span className="sr-only">Entry time</span>
              <input
                type="time"
                required
                value={time}
                onChange={(event) => setTime(event.target.value)}
              />
            </label>
            <span className="journal-editor-kind">{kind}</span>
          </div>

          <input
            ref={titleRef}
            className="journal-entry-title-input"
            type="text"
            maxLength={120}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Give this moment a name"
            aria-label="Entry title"
            autoFocus
          />

          <div className="journal-format-toolbar" role="toolbar" aria-label="Text formatting">
            <button
              type="button"
              onClick={() => insertFormatting('**')}
              aria-label="Bold"
              title="Bold"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('*')}
              aria-label="Italic"
              title="Italic"
            >
              <em>I</em>
            </button>
            <button type="button" onClick={insertLink} aria-label="Insert link">
              <Icon name="link" size={15} />
              Link
            </button>
            <span>Formatting appears when you need it</span>
          </div>

          <textarea
            ref={bodyRef}
            className="journal-body-input"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="What is on your mind?"
            maxLength={25000}
            aria-label="Journal entry"
          />

          <div className="journal-editor-footer">
            <span>{wordCount} words</span>
            <span>{body.length.toLocaleString()} / 25,000</span>
            {entry && (
              <span>
                Updated{' '}
                {new Date(entry.updatedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            )}
          </div>

          <details className="journal-entry-options">
            <summary>Entry details</summary>
            <div className="journal-entry-options-grid">
              <label>
                Entry type
                <select
                  value={kind}
                  onChange={(event) =>
                    setKind(event.target.value as JournalEntryKind)
                  }
                >
                  {KINDS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Tags
                <input
                  type="text"
                  value={tagsText}
                  onChange={(event) => setTagsText(event.target.value)}
                  placeholder="reading, focus"
                />
              </label>
              <label>
                Related habits
                <input
                  type="text"
                  value={habitsText}
                  onChange={(event) => setHabitsText(event.target.value)}
                  placeholder="Reading, Walking"
                />
              </label>
              <label>
                Related resources
                <input
                  type="text"
                  value={resourcesText}
                  onChange={(event) => setResourcesText(event.target.value)}
                  placeholder="Atomic Habits"
                />
              </label>
            </div>
          </details>
        </main>

        <aside className="journal-editor-aside">
          <p>Field note / 25</p>
          <span>
            There is no minimum length. A useful record can be a single honest
            sentence.
          </span>
          <div className="journal-aside-graphic" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <label className="journal-prompt-input">
            Prompt
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Optional question or idea"
              rows={3}
            />
          </label>
          <p className="journal-shortcut-hint">
            Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to save
          </p>
        </aside>
      </form>

      <button
        type="button"
        className="journal-editor-cancel"
        onClick={cancelEditing}
      >
        Discard and return
      </button>
    </div>
  );
}
