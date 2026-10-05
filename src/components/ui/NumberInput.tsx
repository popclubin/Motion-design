interface NumberInputProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}

export function NumberInput({ label, value, min, max, step = 1, onChange }: NumberInputProps) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-[12px] text-muted">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-20 rounded-md border border-border bg-raised px-2 py-1 text-right text-[12px] text-text focus-visible:outline-none"
      />
    </label>
  );
}
