import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

// A module-level pub-sub, not React context: PanelSlot (in ControlsPanel) and
// ControlsPortal (rendered inside Stage's animation tree) are siblings, not
// ancestor/descendant, so context wouldn't reach across them.
let currentSlot: HTMLDivElement | null = null;
const listeners = new Set<(node: HTMLDivElement | null) => void>();

function publish(node: HTMLDivElement | null) {
  currentSlot = node;
  listeners.forEach((listener) => listener(node));
}

/** Hosts the DOM node that `<ControlsPortal>` renders into. Mount once inside ControlsPanel. */
export function PanelSlot() {
  return <div ref={(node) => publish(node)} data-panel-slot="" />;
}

/**
 * Escape hatch for controls that can't be expressed as a param schema
 * (e.g. a card editor). Renders children into the ControlsPanel's slot.
 */
export function ControlsPortal({ children }: { children: ReactNode }) {
  const [node, setNode] = useState<HTMLDivElement | null>(currentSlot);

  useEffect(() => {
    listeners.add(setNode);
    return () => {
      listeners.delete(setNode);
    };
  }, []);

  if (!node) return null;
  return createPortal(children, node);
}
