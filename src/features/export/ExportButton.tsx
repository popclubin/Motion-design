import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { toastError, toastSuccess } from '../../lib/toastStore';
import { useEditorStore } from '../editor/editorStore';
import type { ExportProgressStage } from './exportAnimation';

const STAGE_LABEL: Record<ExportProgressStage, string> = {
  'collecting-source': 'Reading source…',
  'collecting-assets': 'Collecting assets…',
  'generating-project': 'Generating project…',
  zipping: 'Zipping…',
  done: 'Done',
};

export function ExportButton() {
  const [stage, setStage] = useState<ExportProgressStage | null>(null);

  async function handleExport() {
    const { activeSlug, paramsBySlug } = useEditorStore.getState();
    if (!activeSlug) return;

    setStage('collecting-source');
    try {
      const { exportAnimationZip } = await import('./exportAnimation');
      await exportAnimationZip({
        slug: activeSlug,
        paramValues: paramsBySlug[activeSlug] ?? {},
        onProgress: setStage,
      });
      toastSuccess(`${activeSlug}.zip downloaded.`);
    } catch {
      toastError('Export failed — try again.');
    } finally {
      setStage(null);
    }
  }

  return (
    <Button
      variant="primary"
      className="px-2 sm:px-4"
      disabled={stage !== null}
      onClick={() => void handleExport()}
    >
      {stage ? (
        <>
          <Spinner className="border-white/30 border-t-white" />
          {STAGE_LABEL[stage]}
        </>
      ) : (
        'Export'
      )}
    </Button>
  );
}
