import type * as React from 'react';

export interface PropertyProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export function Property({ label, value, className = '' }: PropertyProps) {
  const classes = ['property', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
