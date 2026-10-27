import { useState, type ReactNode } from 'react';
import { cx } from '../../lib/utils';

interface TooltipProps {
  label: string;
  children: ReactNode;
  side?: 'top' | 'bottom';
  align?: 'start' | 'center' | 'end';
  className?: string;
}

export function Tooltip({
  label,
  children,
  side = 'bottom',
  align = 'center',
  className,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);

  const positionClasses = [
    side === 'bottom' ? 'top-full mt-1.5' : 'bottom-full mb-1.5',
    align === 'center'
      ? 'left-1/2 -translate-x-1/2'
      : align === 'end'
      ? 'right-0'
      : 'left-0',
  ].join(' ');

  return (
    <span
      className={cx('relative inline-flex', className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className={cx(
            'pointer-events-none absolute z-50 rounded-md border border-border bg-raised px-2.5 py-1 text-[11px] font-medium whitespace-nowrap text-text shadow-panel',
            positionClasses,
          )}
        >
          {label}
        </span>
      )}
    </span>
  );
}
