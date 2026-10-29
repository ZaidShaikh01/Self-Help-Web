import type { HabitScheduleType } from '~/lib/habits';

interface HabitSchedulePickerProps {
  scheduleType: HabitScheduleType;
  onScheduleTypeChange: (type: HabitScheduleType) => void;
  selectedDays: number[];
  onToggleDay: (day: number) => void;
  inputClass: string;
}

const DAYS = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

export default function HabitSchedulePicker({
  scheduleType,
  onScheduleTypeChange,
  selectedDays,
  onToggleDay,
  inputClass,
}: HabitSchedulePickerProps) {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="habit-schedule" className="text-xs font-mono uppercase tracking-wider text-[var(--text-2)]">
          Schedule
        </label>
        <select
          id="habit-schedule"
          value={scheduleType}
          onChange={(event) =>
            onScheduleTypeChange(event.target.value as HabitScheduleType)
          }
          className={inputClass}
        >
          <option value="daily">Every day</option>
          <option value="weekdays">Monday to Friday</option>
          <option value="custom">Choose specific days</option>
        </select>
      </div>

      {scheduleType === 'custom' && (
        <fieldset>
          <legend className="text-xs font-mono uppercase tracking-wider text-[var(--text-2)] mb-2">
            Repeat on *
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {DAYS.map((day) => {
              const selected = selectedDays.includes(day.value);

              return (
                <button
                  key={day.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onToggleDay(day.value)}
                  className={`rounded-lg border px-3 py-2 text-xs font-mono transition-colors ${
                    selected
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-text)] font-semibold'
                      : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-2)] hover:border-[var(--border-strong)] hover:text-[var(--text)]'
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}
    </div>
  );
}
