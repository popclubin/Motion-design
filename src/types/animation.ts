import type { ComponentType, ReactNode } from 'react';
import type { ParamValues } from '../animations/_core/params';

export type { ParamValues };

export interface AnimationComponentProps {
  params: ParamValues;
  setParams: (patch: ParamValues) => void;
  /** Escape-hatch component: wrap custom UI in `<panel>...</panel>` to render it into the ControlsPanel. Use sparingly. */
  panel: ComponentType<{ children: ReactNode }>;
}

export type AnimationModule = {
  default: ComponentType<AnimationComponentProps>;
};
