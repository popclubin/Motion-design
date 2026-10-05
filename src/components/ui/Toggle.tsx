import { cx } from '../../lib/utils';

interface ToggleProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export function Toggle({ label, checked, onChange, className, disabled }: ToggleProps) {
  return (
    <label
      className={cx(
        'inline-flex cursor-pointer items-center justify-between gap-3 select-none',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      {label && <span className="text-[12px] text-muted">{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          if (!disabled) onChange(!checked);
        }}
        className={cx(
          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full p-0 transition-colors duration-200 focus-visible:outline-none',
          checked ? 'bg-accent' : 'bg-[#26262c] hover:bg-[#2f2f37]',
          disabled && 'pointer-events-none',
        )}
      >
        <span
          className={cx(
            'inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out',
            checked ? 'translate-x-[19px]' : 'translate-x-[3px]',
          )}
        />
      </button>
    </label>
  );
}

