import type { ButtonHTMLAttributes } from 'react';
import { cx } from '../../lib/utils';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
}

export function IconButton({ className, children, ...rest }: IconButtonProps) {
  return (
    <button
      className={cx(
        'inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors duration-150 hover:bg-raised hover:text-text',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
