import type * as React from 'react';

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  copy?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  copy,
  actions,
  className = '',
}: PageHeaderProps) {
  const classes = ['page-header', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {copy && <p>{copy}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}
