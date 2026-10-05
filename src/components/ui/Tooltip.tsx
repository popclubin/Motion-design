import { useState, type ReactNode } from 'react';

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span className="absolute top-full left-1/2 z-50 mt-1.5 -translate-x-1/2 rounded-md border border-border bg-raised px-2 py-1 text-[11px] whitespace-nowrap text-text shadow-panel">
          {label}
        </span>
      )}
    </span>
  );
}
