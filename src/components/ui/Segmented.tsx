import { cx } from '../../lib/utils';

interface SegmentedOption {
  label: string;
  value: string;
}

interface SegmentedProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Segmented({ options, value, onChange, className }: SegmentedProps) {
  return (
    <div
      className={cx(
        'scrollbar-thin flex max-w-full min-w-0 items-center gap-0.5 overflow-x-auto rounded-md border border-border bg-raised p-0.5',
        className,
      )}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cx(
            'shrink-0 whitespace-nowrap rounded-[6px] px-3 py-1 text-[12px] font-medium transition-colors duration-150 cursor-pointer',
            value === opt.value ? 'bg-panel text-text shadow-sm' : 'text-muted hover:text-text',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
