export type ParamValue = number | string | boolean;
export type ParamValues = Record<string, ParamValue>;

interface BaseControl {
  key: string;
  label: string;
  description?: string;
  visibleWhen?: (values: ParamValues) => boolean;
}

export interface SliderControl extends BaseControl {
  type: 'slider';
  default: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}

export interface NumberControl extends BaseControl {
  type: 'number';
  default: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface ToggleControl extends BaseControl {
  type: 'toggle';
  default: boolean;
}

export interface SelectControl extends BaseControl {
  type: 'select';
  default: string;
  options: { label: string; value: string }[];
}

export interface SegmentedControl extends BaseControl {
  type: 'segmented';
  default: string;
  options: { label: string; value: string }[];
  /** When an option is chosen, also apply these param values (e.g. a preset). */
  presets?: Record<string, ParamValues>;
}

export interface ColorControl extends BaseControl {
  type: 'color';
  default: string;
}

export interface TextControl extends BaseControl {
  type: 'text';
  default: string;
  placeholder?: string;
}

export interface ButtonControl extends BaseControl {
  type: 'button';
  /** No default/value — purely an action control, handled by the animation via params.onAction. */
  actionId: string;
}

export interface GroupControl extends BaseControl {
  type: 'group';
  defaultOpen?: boolean;
  children: ParamControl[];
}

export type ParamControl =
  | SliderControl
  | NumberControl
  | ToggleControl
  | SelectControl
  | SegmentedControl
  | ColorControl
  | TextControl
  | ButtonControl
  | GroupControl;

export type ParamSchema = ParamControl[];

function collectValueControls(schema: ParamSchema): Exclude<ParamControl, GroupControl | ButtonControl>[] {
  const result: Exclude<ParamControl, GroupControl | ButtonControl>[] = [];
  for (const control of schema) {
    if (control.type === 'group') {
      result.push(...collectValueControls(control.children));
    } else if (control.type !== 'button') {
      result.push(control);
    }
  }
  return result;
}

export function defaultValuesFromSchema(schema: ParamSchema): ParamValues {
  return Object.fromEntries(collectValueControls(schema).map((c) => [c.key, c.default]));
}
