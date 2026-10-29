import { Icon } from './Icon';

export interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  shortcut?: string;
  onClear?: () => void;
  className?: string;
  ariaLabel?: string;
}

export function SearchField({
  value,
  onChange,
  placeholder = 'Search…',
  shortcut,
  onClear,
  className = '',
  ariaLabel = 'Search',
}: SearchFieldProps) {
  const classes = ['search-field', className].filter(Boolean).join(' ');

  return (
    <label className={classes} aria-label={ariaLabel}>
      <Icon name="search" size={17} />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {shortcut && !value && <kbd>{shortcut}</kbd>}
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          style={{ padding: 0, display: 'inline-flex', alignItems: 'center' }}
        >
          <Icon name="close" size={15} />
        </button>
      )}
    </label>
  );
}
