import type { CSSProperties } from 'react';

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

export default function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={`block animate-pulse rounded bg-[var(--surface-inset)] ${className}`}
      style={style}
    />
  );
}
