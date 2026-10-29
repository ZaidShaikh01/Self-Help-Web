import type * as React from 'react';

export interface SectionLabelProps {
  index: string;
  title: string;
  className?: string;
}

export function SectionLabel({ index, title, className = '' }: SectionLabelProps) {
  const classes = ['section-label', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <span>{index}</span>
      <h2>{title}</h2>
    </div>
  );
}
