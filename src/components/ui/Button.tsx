import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: ReactNode;
}

export function Button({ variant = 'secondary', className, type = 'button', children, ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        'inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 text-[13px] font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-accent text-white hover:bg-accent-hover',
        variant === 'secondary' &&
          'border border-border bg-raised text-text hover:bg-border',
        variant === 'ghost' && 'text-muted hover:bg-raised hover:text-text',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
