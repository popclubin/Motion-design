import type { AnimationManifest } from '../../animations/_core/manifest';
import type { ParamValues } from '../../animations/_core/params';

export function appTsxTemplate(manifest: AnimationManifest, initialValues: ParamValues): string {
  return `import { useState } from 'react';
import { Button } from './ui/Button';
import { ColorInput } from './ui/ColorInput';
import { NumberInput } from './ui/NumberInput';
import { Section } from './ui/Section';
import { Segmented } from './ui/Segmented';
import { Select } from './ui/Select';
import { Slider } from './ui/Slider';
import { Toggle } from './ui/Toggle';
import Animation from './animations/${manifest.slug}';
import paramSchema from './animations/${manifest.slug}/params';
import { ControlsPortal, PanelSlot } from './animations/support/ControlsPortal';

const INITIAL_VALUES = ${JSON.stringify(initialValues, null, 2)};

function ParamField({ control, value, onChange, onChangeMany }) {
  switch (control.type) {
    case 'slider':
      return (
        <Slider label={control.label} value={Number(value ?? control.default)} min={control.min} max={control.max} step={control.step} onChange={onChange} />
      );
    case 'number':
      return (
        <NumberInput label={control.label} value={Number(value ?? control.default)} min={control.min} max={control.max} step={control.step} onChange={onChange} />
      );
    case 'color':
      return <ColorInput label={control.label} value={String(value ?? control.default)} onChange={onChange} />;
    case 'toggle':
      return <Toggle label={control.label} checked={Boolean(value ?? control.default)} onChange={onChange} />;
    case 'select':
      return <Select label={control.label} value={String(value ?? control.default)} options={control.options} onChange={onChange} />;
    case 'segmented':
      return (
        <div className="flex items-center justify-between gap-3">
          <span className="text-[12px] text-muted">{control.label}</span>
          <Segmented
            options={control.options}
            value={String(value ?? control.default)}
            onChange={(next) => {
              const preset = control.presets?.[next];
              onChangeMany(preset ? { [control.key]: next, ...preset } : { [control.key]: next });
            }}
          />
        </div>
      );
    case 'text':
      return (
        <label className="flex items-center justify-between gap-3">
          <span className="text-[12px] text-muted">{control.label}</span>
          <input
            type="text"
            value={String(value ?? control.default)}
            onChange={(e) => onChange(e.target.value)}
            className="w-32 rounded-md border border-border bg-raised px-2 py-1 text-[12px] text-text focus-visible:outline-none"
          />
        </label>
      );
    case 'button':
      return (
        <Button variant="secondary" onClick={() => onChangeMany({ [control.actionId]: Date.now() })}>
          {control.label}
        </Button>
      );
    default:
      return null;
  }
}

function ControlList({ controls, values, onChange, onChangeMany }) {
  return controls.map((control) => {
    if (control.visibleWhen && !control.visibleWhen(values)) return null;
    if (control.type === 'group') {
      return (
        <Section key={control.key} title={control.label} defaultOpen={control.defaultOpen}>
          <ControlList controls={control.children} values={values} onChange={onChange} onChangeMany={onChangeMany} />
        </Section>
      );
    }
    return (
      <ParamField
        key={control.key}
        control={control}
        value={values[control.key]}
        onChange={(value) => onChange(control.key, value)}
        onChangeMany={onChangeMany}
      />
    );
  });
}

export default function App() {
  const [params, setParamsState] = useState(INITIAL_VALUES);

  const setParams = (patch) => setParamsState((prev) => ({ ...prev, ...patch }));
  const setParam = (key, value) => setParamsState((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="flex h-screen w-screen">
      <div className="flex flex-1 items-center justify-center p-10">
        <div className="h-full w-full max-w-[720px] overflow-hidden rounded-[var(--radius-lg)] border border-border bg-panel">
          <Animation params={params} setParams={setParams} panel={ControlsPortal} />
        </div>
      </div>
      <aside className="w-[320px] overflow-y-auto border-l border-border bg-panel p-4">
        <h1 className="mb-3 text-[14px] font-semibold text-text">${manifest.name}</h1>
        <ControlList controls={paramSchema} values={params} onChange={setParam} onChangeMany={setParams} />
        <PanelSlot />
      </aside>
    </div>
  );
}
`;
}
