import type * as React from 'react';

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className = '',
}: EmptyStateProps) {
  const classes = ['empty-state', className].filter(Boolean).join(' ');

  return (
    <div className={classes} role="region" aria-label={title}>
      {icon && <div style={{ marginBottom: 12 }}>{icon}</div>}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
