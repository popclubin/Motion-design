import { cx } from '../../lib/utils';

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cx(
        'inline-block h-4 w-4 animate-spin rounded-full border-2 border-border border-t-accent',
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  );
}
