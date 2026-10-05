import { createContext, useContext, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

const PanelSlotContext = createContext<HTMLDivElement | null>(null);

/** Hosts the DOM node that `<ControlsPortal>` renders into. Mount once inside ControlsPanel. */
export function PanelSlot() {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  return (
    <PanelSlotContext.Provider value={node}>
      <div ref={setNode} data-panel-slot="" />
    </PanelSlotContext.Provider>
  );
}

/**
 * Escape hatch for controls that can't be expressed as a param schema
 * (e.g. a card editor). Renders children into the ControlsPanel's slot.
 */
export function ControlsPortal({ children }: { children: ReactNode }) {
  const node = useContext(PanelSlotContext);
  if (!node) return null;
  return createPortal(children, node);
}
