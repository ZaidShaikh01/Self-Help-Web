import { NavLink } from 'react-router';
import { Icon } from '~/components/ui/Icon';

interface MobileNavProps {
  onSearch?: () => void;
}

const ITEMS = [
  { id: 'today', label: 'Today', icon: 'today', to: '/dashboard' },
  { id: 'habits', label: 'Habits', icon: 'habits', to: '/habits' },
  { id: 'library', label: 'Library', icon: 'library', to: '/library' },
  { id: 'journal', label: 'Journal', icon: 'journal', to: '/journal' },
  { id: 'notifications', label: 'Alerts', icon: 'bell', to: '/notifications' },
] as const;

export default function MobileNav({ onSearch = () => {} }: MobileNavProps) {
  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {ITEMS.map(({ id, label, icon, to }) => (
        <NavLink
          key={id}
          to={to}
          className={({ isActive }) => (isActive ? 'is-active' : '')}
        >
          <Icon name={icon} size={18} />
          <span>{label}</span>
        </NavLink>
      ))}
      <button type="button" onClick={onSearch} aria-label="Search all content">
        <Icon name="search" size={18} />
        <span>Search</span>
      </button>
    </nav>
  );
}
