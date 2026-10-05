import { ChevronDown } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { cx } from '../../lib/utils';

interface SectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function Section({ title, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border py-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">
          {title}
        </span>
        <ChevronDown
          size={14}
          className={cx('text-muted transition-transform duration-150', open && 'rotate-180')}
        />
      </button>
      {open && <div className="mt-3 flex flex-col gap-3">{children}</div>}
    </div>
  );
}
