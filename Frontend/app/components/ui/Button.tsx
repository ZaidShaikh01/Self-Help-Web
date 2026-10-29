import type * as React from 'react';
import { Icon, type IconName } from './Icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  icon?: IconName | string | React.ReactNode;
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger';
  className?: string;
}

export function Button({
  children,
  icon,
  variant = 'secondary',
  className = '',
  type = 'button',
  disabled = false,
  ...rest
}: ButtonProps) {
  const variantClass = variant === 'secondary' ? '' : variant;
  const classes = ['button', variantClass, className].filter(Boolean).join(' ');

  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === 'string') {
      return <Icon name={icon as IconName} size={16} />;
    }
    return icon;
  };

  return (
    <button type={type} className={classes} disabled={disabled} {...rest}>
      {renderIcon()}
      {children}
    </button>
  );
}

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName | string | React.ReactNode;
  quiet?: boolean;
  className?: string;
  size?: number;
}

export function IconButton({
  icon,
  quiet = false,
  className = '',
  size = 18,
  type = 'button',
  ...rest
}: IconButtonProps) {
  const classes = ['icon-button', quiet ? 'quiet' : '', className].filter(Boolean).join(' ');

  const renderIcon = () => {
    if (typeof icon === 'string') {
      return <Icon name={icon as IconName} size={size} />;
    }
    return icon;
  };

  return (
    <button type={type} className={classes} {...rest}>
      {renderIcon()}
    </button>
  );
}
