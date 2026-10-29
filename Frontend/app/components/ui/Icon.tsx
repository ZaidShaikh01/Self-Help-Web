import type * as React from 'react';

export type IconName =
  | 'today'
  | 'habits'
  | 'library'
  | 'journal'
  | 'timeline'
  | 'insights'
  | 'search'
  | 'plus'
  | 'moon'
  | 'sun'
  | 'chevron'
  | 'down'
  | 'close'
  | 'check'
  | 'undo'
  | 'menu'
  | 'filter'
  | 'grid'
  | 'list'
  | 'edit'
  | 'book'
  | 'path'
  | 'focus'
  | 'bell'
  | 'arrow'
  | 'more'
  | 'archive'
  | 'link';

interface IconProps {
  name: IconName | string;
  size?: number;
  className?: string;
}

const paths: Record<string, React.ReactNode> = {
  today: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </>
  ),
  habits: (
    <>
      <path d="M5 12.5 9.2 17 19 7" />
      <path d="M5 6h8" />
    </>
  ),
  library: (
    <>
      <path d="M5 4h10a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2Z" />
      <path d="M7 16h10M9 8h5" />
    </>
  ),
  journal: (
    <>
      <path d="M5 3h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2Z" />
      <path d="M8 7h7M8 11h7M8 15h4" />
    </>
  ),
  timeline: (
    <>
      <path d="M7 3v18" />
      <circle cx="7" cy="7" r="2" />
      <circle cx="7" cy="16" r="2" />
      <path d="M11 7h7M11 16h5" />
    </>
  ),
  insights: (
    <>
      <path d="M4 19V9M10 19V5M16 19v-7M3 19h18" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 4 4" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  moon: <path d="M20 15.5A8 8 0 0 1 8.5 4 8 8 0 1 0 20 15.5Z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  chevron: <path d="m9 6 6 6-6 6" />,
  down: <path d="m6 9 6 6 6-6" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  check: <path d="m5 12 4 4 10-10" />,
  undo: (
    <>
      <path d="M9 7 5 11l4 4" />
      <path d="M5 11h8a6 6 0 0 1 6 6" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  filter: <path d="M4 6h16M7 12h10M10 18h4" />,
  grid: (
    <>
      <rect x="4" y="4" width="6" height="6" />
      <rect x="14" y="4" width="6" height="6" />
      <rect x="4" y="14" width="6" height="6" />
      <rect x="14" y="14" width="6" height="6" />
    </>
  ),
  list: (
    <>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="5" cy="6" r=".8" fill="currentColor" />
      <circle cx="5" cy="12" r=".8" fill="currentColor" />
      <circle cx="5" cy="18" r=".8" fill="currentColor" />
    </>
  ),
  edit: (
    <>
      <path d="m4 20 4.5-1 10-10a2 2 0 0 0-3-3l-10 10Z" />
      <path d="m14.5 7.5 3 3" />
    </>
  ),
  book: (
    <>
      <path d="M4 5a3 3 0 0 1 3-2h5v17H7a3 3 0 0 0-3 2Z" />
      <path d="M20 5a3 3 0 0 0-3-2h-5v17h5a3 3 0 0 1 3 2Z" />
    </>
  ),
  path: (
    <>
      <path d="M6 20c0-5 12-5 12-10 0-3-2-5-5-5" />
      <circle cx="6" cy="20" r="2" />
      <circle cx="13" cy="5" r="2" />
    </>
  ),
  focus: (
    <>
      <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </>
  ),
  arrow: <path d="M5 12h14M14 7l5 5-5 5" />,
  more: (
    <>
      <circle cx="5" cy="12" r="1" fill="currentColor" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="19" cy="12" r="1" fill="currentColor" />
    </>
  ),
  archive: (
    <>
      <path d="M4 7h16v13H4Z" />
      <path d="M3 3h18v4H3ZM9 11h6" />
    </>
  ),
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1-1" />
    </>
  ),
};

export function Icon({ name, size = 20, className = '' }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] ?? paths['more']}
    </svg>
  );
}
