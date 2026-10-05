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

export const SUPPORT_CONTROLS_PORTAL_TSX = `import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Module-level pub-sub, not React context: PanelSlot and ControlsPortal are
// siblings in the layout, not ancestor/descendant, so context wouldn't reach.
let currentSlot = null;
const listeners = new Set();

function publish(node) {
  currentSlot = node;
  listeners.forEach((listener) => listener(node));
}

export function PanelSlot() {
  return <div ref={(node) => publish(node)} data-panel-slot="" />;
}

export function ControlsPortal({ children }) {
  const [node, setNode] = useState(currentSlot);

  useEffect(() => {
    listeners.add(setNode);
    return () => {
      listeners.delete(setNode);
    };
  }, []);

  if (!node) return null;
  return createPortal(children, node);
}
`;
