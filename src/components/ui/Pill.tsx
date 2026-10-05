import type { ReactNode } from 'react';
import { cx } from '../../lib/utils';

export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold tracking-wide text-muted uppercase',
        className,
      )}
    >
      {children}
    </span>
  );
}
