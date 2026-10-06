import { Play, RotateCcw } from 'lucide-react';
import { useParams } from 'react-router';
import { ColorInput } from '../../components/ui/ColorInput';
import { NumberInput } from '../../components/ui/NumberInput';
import { Section } from '../../components/ui/Section';
import { Segmented } from '../../components/ui/Segmented';
import { Select } from '../../components/ui/Select';
import { Slider } from '../../components/ui/Slider';
import { Toggle } from '../../components/ui/Toggle';
import { Button } from '../../components/ui/Button';
import { PanelSlot } from '../../animations/_core/ControlsPortal';
import { getAnimationEntry } from '../../animations/registry';
import { defaultValuesFromSchema, type ParamControl, type ParamValues } from '../../animations/_core/params';
import { useEditorStore } from './editorStore';

export function ControlsPanel() {
  const { slug: routeSlug } = useParams();
  const storeActiveSlug = useEditorStore((s) => s.activeSlug);
  const activeSlug = storeActiveSlug || routeSlug;
  const paramsBySlug = useEditorStore((s) => s.paramsBySlug);
  const setParam = useEditorStore((s) => s.setParam);
  const setParams = useEditorStore((s) => s.setParams);
  const resetParams = useEditorStore((s) => s.resetParams);
  const restart = useEditorStore((s) => s.restart);

  const entry = activeSlug ? getAnimationEntry(activeSlug) : undefined;
  const values = activeSlug
    ? (paramsBySlug[activeSlug] ?? (entry ? defaultValuesFromSchema(entry.schema) : {}))
    : {};

  if (!entry) {
    return (
      <aside className="h-full w-[var(--panel-width)] shrink-0 overflow-hidden border-l border-border bg-panel p-4">
        <p className="text-[12px] text-muted">Select an animation to edit its parameters.</p>
      </aside>
    );
  }

  return (
    <aside className="flex h-full w-[var(--panel-width)] shrink-0 flex-col border-l border-border bg-panel overflow-hidden">
      {/* Sticky top action bar with Play and Reset buttons */}
      <div className="sticky top-0 z-20 flex shrink-0 items-center gap-2 border-b border-border bg-panel p-3">
        <Button
          variant="secondary"
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[12px]"
          onClick={restart}
        >
          <Play size={13} className="text-accent fill-accent shrink-0" />
          <span className="truncate">Play animation</span>
        </Button>
        <Button
          variant="secondary"
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[12px]"
          onClick={resetParams}
        >
          <RotateCcw size={13} className="text-muted shrink-0" />
          <span className="truncate">Reset to default</span>
        </Button>
      </div>

      <div className="scrollbar-thin flex-1 overflow-x-hidden overflow-y-auto px-5 py-4 pb-20">
        <div className="flex flex-col gap-5 min-w-0 max-w-full">
          <ControlList
            controls={entry.schema}
            values={values}
            onChange={setParam}
            onChangeMany={setParams}
          />
        </div>
        <div className="mt-4 min-w-0 max-w-full">
          <PanelSlot />
        </div>
      </div>
    </aside>
  );
}

function ControlList({
  controls,
  values,
  onChange,
  onChangeMany,
}: {
  controls: ParamControl[];
  values: ParamValues;
  onChange: (key: string, value: ParamValues[string]) => void;
  onChangeMany: (patch: ParamValues) => void;
}) {
  return (
    <div className="flex flex-col gap-4 min-w-0 max-w-full">
      {controls.map((control) => {
        if (control.visibleWhen && !control.visibleWhen(values)) return null;

        if (control.type === 'group') {
          return (
            <Section key={control.key} title={control.label} defaultOpen={control.defaultOpen}>
              <ControlList
                controls={control.children}
                values={values}
                onChange={onChange}
                onChangeMany={onChangeMany}
              />
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
      })}
    </div>
  );
}

function ParamField({
  control,
  value,
  onChange,
  onChangeMany,
}: {
  control: Exclude<ParamControl, { type: 'group' }>;
  value: ParamValues[string] | undefined;
  onChange: (value: ParamValues[string]) => void;
  onChangeMany: (patch: ParamValues) => void;
}) {
  switch (control.type) {
    case 'slider':
      return (
        <Slider
          label={control.label}
          value={Number(value ?? control.default)}
          min={control.min}
          max={control.max}
          step={control.step}
          onChange={onChange}
        />
      );
    case 'number':
      return (
        <NumberInput
          label={control.label}
          value={Number(value ?? control.default)}
          min={control.min}
          max={control.max}
          step={control.step}
          onChange={onChange}
        />
      );
    case 'color':
      return (
        <ColorInput
          label={control.label}
          value={String(value ?? control.default)}
          onChange={onChange}
        />
      );
    case 'toggle':
      return (
        <Toggle
          label={control.label}
          checked={Boolean(value ?? control.default)}
          onChange={onChange}
        />
      );
    case 'select':
      return (
        <Select
          label={control.label}
          value={String(value ?? control.default)}
          options={control.options}
          onChange={onChange}
        />
      );
    case 'segmented':
      return (
        <div className="flex flex-col gap-1.5 min-w-0 max-w-full">
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
            placeholder={control.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="w-32 rounded-md border border-border bg-raised px-2 py-1 text-[12px] text-text focus-visible:outline-none"
          />
        </label>
      );
    case 'button':
      return (
        <Button
          variant="secondary"
          onClick={() => onChangeMany({ [control.actionId]: Date.now() })}
        >
          {control.label}
        </Button>
      );
    default:
      return null;
  }
}
