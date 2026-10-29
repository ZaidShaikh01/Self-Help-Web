import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '~/components/ui/Button';
import { Icon } from '~/components/ui/Icon';
import HabitSchedulePicker from './HabitSchedulePicker';
import HabitReminderPicker from './HabitReminderPicker';
import type {
  CreateHabitInput,
  Habit,
  HabitScheduleType,
} from '~/lib/habits';

interface HabitFormModalProps {
  habit: Habit | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (data: CreateHabitInput) => Promise<boolean>;
}

const inputClass =
  'mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]';

function localDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export default function HabitFormModal({
  habit,
  isSaving,
  onClose,
  onSave,
}: HabitFormModalProps) {
  const [title, setTitle] = useState(habit?.title ?? '');
  const [description, setDescription] = useState(habit?.description ?? '');
  const [tagsInput, setTagsInput] = useState(habit?.tags.join(', ') ?? '');

  const [scheduleType, setScheduleType] = useState<HabitScheduleType>(
    habit?.schedule.type ?? 'daily',
  );

  const [selectedDays, setSelectedDays] = useState<number[]>(
    habit?.schedule.daysOfWeek ?? [1, 2, 3, 4, 5],
  );

  const [targetCount, setTargetCount] = useState(
    String(habit?.target.count ?? 1),
  );
  const [targetUnit, setTargetUnit] = useState(habit?.target.unit ?? 'times');

  const [startDate, setStartDate] = useState(
    habit?.startDate ?? localDateString(new Date()),
  );
  const [endDate, setEndDate] = useState(habit?.endDate ?? '');

  const [reminderEnabled, setReminderEnabled] = useState(
    habit?.reminder.enabled ?? false,
  );
  const [reminderTime, setReminderTime] = useState(
    habit?.reminder.time ?? '08:00',
  );

  const [color, setColor] = useState(habit?.color ?? '#fa3600');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isSaving) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSaving, onClose]);

  function toggleDay(day: number) {
    setSelectedDays((current) =>
      current.includes(day)
        ? current.filter((value) => value !== day)
        : [...current, day].sort(),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');

    const cleanTitle = title.trim();

    if (!cleanTitle) {
      setFormError('Enter a habit name.');
      return;
    }

    if (scheduleType === 'custom' && selectedDays.length === 0) {
      setFormError('Choose at least one day for a custom schedule.');
      return;
    }

    const count = Number(targetCount);

    if (!Number.isInteger(count) || count < 1) {
      setFormError('The target must be a whole number of at least 1.');
      return;
    }

    if (endDate && endDate < startDate) {
      setFormError('The end date cannot be before the start date.');
      return;
    }

    if (reminderEnabled && !reminderTime) {
      setFormError('Choose a time for the reminder.');
      return;
    }

    const tags = [
      ...new Set(
        tagsInput
          .split(',')
          .map((tag) => tag.trim().toLowerCase())
          .filter(Boolean),
      ),
    ];

    if (tags.length > 10) {
      setFormError('You can add a maximum of 10 tags.');
      return;
    }

    const data: CreateHabitInput = {
      title: cleanTitle,
      description: description.trim() || undefined,
      tags,
      schedule:
        scheduleType === 'custom'
          ? { type: scheduleType, daysOfWeek: selectedDays }
          : { type: scheduleType },
      target: {
        count,
        unit: targetUnit.trim() || 'times',
      },
      timezone:
        habit?.timezone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone ||
        'Asia/Kolkata',
      startDate,
      endDate: endDate || undefined,
      reminder: reminderEnabled
        ? { enabled: true, time: reminderTime }
        : { enabled: false },
      color,
    };

    const succeeded = await onSave(data);
    if (succeeded) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="habit-form-title"
        className="my-auto max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[var(--accent)]">
              {habit ? 'Edit practice' : 'New practice'}
            </p>

            <h2
              id="habit-form-title"
              className="mt-1 text-xl font-medium tracking-tight text-[var(--text)]"
            >
              {habit ? 'Edit habit' : 'Create a habit'}
            </h2>

            <p className="mt-1 text-xs text-[var(--text-3)]">
              Define a routine you can realistically repeat.
            </p>
          </div>

          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            aria-label="Close habit dialog"
            className="rounded-lg p-1.5 text-[var(--text-3)] hover:bg-[var(--canvas-2)] hover:text-[var(--text)] disabled:opacity-50"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {formError && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-600"
          >
            {formError}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="habit-title" className="text-xs font-mono uppercase tracking-wider text-[var(--text-2)]">
              Habit name *
            </label>
            <input
              id="habit-title"
              required
              maxLength={80}
              autoFocus
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Read for 20 minutes"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="habit-description"
              className="text-xs font-mono uppercase tracking-wider text-[var(--text-2)]"
            >
              Description
            </label>
            <textarea
              id="habit-description"
              maxLength={300}
              rows={2}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Why is this habit important to you?"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="habit-tags" className="text-xs font-mono uppercase tracking-wider text-[var(--text-2)]">
              Tags
            </label>
            <input
              id="habit-tags"
              value={tagsInput}
              onChange={(event) => setTagsInput(event.target.value)}
              placeholder="health, learning, focus"
              className={inputClass}
            />
            <p className="mt-1 text-[11px] text-[var(--text-3)]">
              Separate tags with commas, up to 10 tags.
            </p>
          </div>

          <HabitSchedulePicker
            scheduleType={scheduleType}
            onScheduleTypeChange={setScheduleType}
            selectedDays={selectedDays}
            onToggleDay={toggleDay}
            inputClass={inputClass}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="habit-target-count"
                className="text-xs font-mono uppercase tracking-wider text-[var(--text-2)]"
              >
                Daily target *
              </label>
              <input
                id="habit-target-count"
                type="number"
                min={1}
                max={100000}
                step={1}
                required
                value={targetCount}
                onChange={(event) => setTargetCount(event.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="habit-target-unit"
                className="text-xs font-mono uppercase tracking-wider text-[var(--text-2)]"
              >
                Target unit
              </label>
              <input
                id="habit-target-unit"
                maxLength={20}
                value={targetUnit}
                onChange={(event) => setTargetUnit(event.target.value)}
                placeholder="pages, glasses, times..."
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="habit-start-date"
                className="text-xs font-mono uppercase tracking-wider text-[var(--text-2)]"
              >
                Start date *
              </label>
              <input
                id="habit-start-date"
                type="date"
                required
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="habit-end-date"
                className="text-xs font-mono uppercase tracking-wider text-[var(--text-2)]"
              >
                End date
              </label>
              <input
                id="habit-end-date"
                type="date"
                min={startDate}
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-[11px] text-[var(--text-3)]">
                Leave blank for no end date.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="habit-color"
                className="text-xs font-mono uppercase tracking-wider text-[var(--text-2)]"
              >
                Accent color
              </label>
              <div className="mt-1 flex items-center gap-3">
                <input
                  id="habit-color"
                  type="color"
                  value={color}
                  onChange={(event) => setColor(event.target.value)}
                  className="h-9 w-14 cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1"
                />
                <span className="font-mono text-xs uppercase text-[var(--text-3)]">
                  {color}
                </span>
              </div>
            </div>
          </div>

          <HabitReminderPicker
            reminderEnabled={reminderEnabled}
            onReminderEnabledChange={setReminderEnabled}
            reminderTime={reminderTime}
            onReminderTimeChange={setReminderTime}
            inputClass={inputClass}
          />

          <div className="flex flex-col-reverse gap-2 border-t border-[var(--border-subtle)] pt-4 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              type="button"
              disabled={isSaving}
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? 'Saving…' : habit ? 'Save changes' : 'Create habit'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
