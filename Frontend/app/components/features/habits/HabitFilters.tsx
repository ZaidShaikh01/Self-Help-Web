import { Icon } from '~/components/ui/Icon';

interface HabitFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  availableTags: string[];
  selectedTag: string;
  onTagChange: (value: string) => void;
}

export default function HabitFilters({
  search,
  onSearchChange,
  availableTags,
  selectedTag,
  onTagChange,
}: HabitFiltersProps) {
  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
      <label className="relative block w-full sm:w-64">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]">
          <Icon name="search" size={15} />
        </span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search habits or tags…"
          aria-label="Search habits"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-3 text-xs text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
        />
      </label>

      <select
        value={selectedTag}
        onChange={(event) => onTagChange(event.target.value)}
        aria-label="Filter habits by tag"
        className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-mono uppercase text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
      >
        <option value="all">All tags</option>
        {availableTags.map((tag) => (
          <option key={tag} value={tag}>
            #{tag}
          </option>
        ))}
      </select>
    </div>
  );
}
