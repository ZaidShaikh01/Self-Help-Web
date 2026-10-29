interface HabitReminderPickerProps {
  reminderEnabled: boolean;
  onReminderEnabledChange: (enabled: boolean) => void;
  reminderTime: string;
  onReminderTimeChange: (time: string) => void;
  inputClass: string;
}

export default function HabitReminderPicker({
  reminderEnabled,
  onReminderEnabledChange,
  reminderTime,
  onReminderTimeChange,
  inputClass,
}: HabitReminderPickerProps) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--canvas-2)] p-4">
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={reminderEnabled}
          onChange={(event) => onReminderEnabledChange(event.target.checked)}
          className="h-4 w-4 accent-[var(--accent)]"
        />

        <div>
          <span className="block text-xs font-mono uppercase tracking-wider text-[var(--text)]">
            Enable reminder
          </span>
          <span className="mt-0.5 block text-[11px] text-[var(--text-3)]">
            Save a preferred reminder time for this habit.
          </span>
        </div>
      </label>

      {reminderEnabled && (
        <div className="mt-3">
          <label
            htmlFor="habit-reminder-time"
            className="text-xs font-mono uppercase tracking-wider text-[var(--text-2)]"
          >
            Reminder time *
          </label>
          <input
            id="habit-reminder-time"
            type="time"
            required
            value={reminderTime}
            onChange={(event) => onReminderTimeChange(event.target.value)}
            className={inputClass}
          />
        </div>
      )}
    </section>
  );
}
