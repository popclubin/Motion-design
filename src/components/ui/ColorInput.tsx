interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorInput({ label, value, onChange }: ColorInputProps) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-[12px] text-muted">{label}</span>
      <span className="flex items-center gap-2 rounded-md border border-border bg-raised px-2 py-1">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-4 w-4 cursor-pointer rounded border-none bg-transparent p-0"
        />
        <span className="text-[12px] tabular-nums text-text">{value}</span>
      </span>
    </label>
  );
}
