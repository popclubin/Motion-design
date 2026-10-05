interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

export function Slider({ label, value, min, max, step = 1, onChange }: SliderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[12px] text-muted">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-1 w-24 cursor-pointer appearance-none rounded-full bg-border accent-accent"
        />
        <span className="w-10 text-right text-[12px] tabular-nums text-text">{value}</span>
      </div>
    </div>
  );
}
