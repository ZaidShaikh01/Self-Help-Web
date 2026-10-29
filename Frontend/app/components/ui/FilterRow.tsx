export interface FilterRowProps {
  options: readonly string[] | string[];
  selected: string;
  onSelect: (value: string) => void;
  className?: string;
  ariaLabel?: string;
}

export function FilterRow({
  options,
  selected,
  onSelect,
  className = '',
  ariaLabel = 'Filter options',
}: FilterRowProps) {
  const classes = ['filter-row', className].filter(Boolean).join(' ');

  return (
    <div className={classes} role="toolbar" aria-label={ariaLabel}>
      {options.map((option) => {
        const isActive = option === selected;
        return (
          <button
            key={option}
            type="button"
            className={isActive ? 'is-active' : ''}
            onClick={() => onSelect(option)}
            aria-pressed={isActive}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
