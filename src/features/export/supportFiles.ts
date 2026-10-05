/**
 * Standalone replacements for src/animations/_core/* and src/types/animation.ts.
 * The real versions depend on the app's Zustand editor store; these are
 * self-contained so an exported animation folder runs with no other app code.
 */

export const SUPPORT_MANIFEST_TS = `export function defineManifest(manifest) {
  return manifest;
}
`;

export const SUPPORT_PARAMS_TS = `export type ParamValues = Record<string, number | string | boolean>;
export type ParamControl = any;
export type ParamSchema = ParamControl[];

export function defaultValuesFromSchema(schema) {
  const values = {};
  const collect = (controls) => {
    for (const control of controls) {
      if (control.type === 'group') collect(control.children);
      else if (control.type !== 'button') values[control.key] = control.default;
    }
  };
  collect(schema);
  return values;
}
`;

export const SUPPORT_USE_PLAYBACK_TS = `import { useEffect, useState } from 'react';

export function usePlayback() {
  const [isPaused, setIsPaused] = useState(() => document.hidden);

  useEffect(() => {
    const onVisibilityChange = () => setIsPaused(document.hidden);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  return { isPaused };
}
`;

export const SUPPORT_TYPES_TS = `import type { ComponentType, ReactNode } from 'react';

export type ParamValues = Record<string, number | string | boolean>;

export interface AnimationComponentProps {
  params: ParamValues;
  setParams: (patch: ParamValues) => void;
  panel: ComponentType<{ children: ReactNode }>;
}
`;

export const SUPPORT_CONTROLS_PORTAL_TSX = `import { createContext, useContext, useState } from 'react';
import { createPortal } from 'react-dom';

const PanelSlotContext = createContext(null);

export function PanelSlot() {
  const [node, setNode] = useState(null);
  return (
    <PanelSlotContext.Provider value={node}>
      <div ref={setNode} data-panel-slot="" />
    </PanelSlotContext.Provider>
  );
}

export function ControlsPortal({ children }) {
  const node = useContext(PanelSlotContext);
  if (!node) return null;
  return createPortal(children, node);
}
`;
