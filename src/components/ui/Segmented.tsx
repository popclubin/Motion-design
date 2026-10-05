import { cx } from '../../lib/utils';

interface SegmentedOption {
  label: string;
  value: string;
}

interface SegmentedProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
}

export function Segmented({ options, value, onChange }: SegmentedProps) {
  return (
    <div className="inline-flex rounded-md border border-border bg-raised p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cx(
            'rounded-[6px] px-3 py-1 text-[12px] font-medium transition-colors duration-150',
            value === opt.value ? 'bg-panel text-text shadow-sm' : 'text-muted hover:text-text',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
