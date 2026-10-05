import { useEditorStore } from '../../features/editor/editorStore';

/** True while the stage is visible and should animate; false when the tab/document is hidden. */
export function usePlayback(): { isPaused: boolean } {
  const isPaused = useEditorStore((s) => s.isPaused);
  return { isPaused };
}
