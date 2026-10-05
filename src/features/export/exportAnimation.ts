import JSZip from 'jszip';
import { getAnimationEntry } from '../../animations/registry';
import type { ParamValues } from '../../animations/_core/params';
import { appTsxTemplate } from './appTemplate';
import {
  SUPPORT_CONTROLS_PORTAL_TSX,
  SUPPORT_MANIFEST_TS,
  SUPPORT_PARAMS_TS,
  SUPPORT_TYPES_TS,
  SUPPORT_USE_PLAYBACK_TS,
} from './supportFiles';
import {
  INDEX_CSS_TEMPLATE,
  MAIN_TSX_TEMPLATE,
  TSCONFIG_TEMPLATE,
  VITE_CONFIG_TEMPLATE,
  indexHtmlTemplate,
  packageJsonTemplate,
  readmeTemplate,
} from './templates';
import { collectStandaloneUiComponents } from './uiComponents';

// Lazily fetched only when exporting — source text never sits in the main app bundle.
const animationSourceLoaders = import.meta.glob('/src/animations/*/**/*', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>;

function rewriteAnimationSource(raw: string, slug: string): string {
  return raw
    .replaceAll("from '../_core/manifest'", "from '../support/manifest'")
    .replaceAll("from '../_core/params'", "from '../support/params'")
    .replaceAll("from '../_core/usePlayback'", "from '../support/usePlayback'")
    .replaceAll("from '../_core/ControlsPortal'", "from '../support/ControlsPortal'")
    .replaceAll("from '../../types/animation'", "from '../support/types'")
    .replaceAll(new RegExp(`/animations/${slug}/`, 'g'), '/');
}

interface AssetManifest {
  [slug: string]: string[];
}

async function fetchAnimationAssets(slug: string): Promise<{ path: string; blob: Blob }[]> {
  const manifestResponse = await fetch('/animation-assets-manifest.json').catch(() => null);
  if (!manifestResponse?.ok) return [];

  const manifest = (await manifestResponse.json()) as AssetManifest;
  const assetPaths = manifest[slug] ?? [];

  return Promise.all(
    assetPaths.map(async (path) => {
      const response = await fetch(path);
      return { path, blob: await response.blob() };
    }),
  );
}

export type ExportProgressStage =
  | 'collecting-source'
  | 'collecting-assets'
  | 'generating-project'
  | 'zipping'
  | 'done';

export interface ExportOptions {
  slug: string;
  paramValues: ParamValues;
  onProgress?: (stage: ExportProgressStage) => void;
}

export async function exportAnimationZip({ slug, paramValues, onProgress }: ExportOptions): Promise<void> {
  const entry = getAnimationEntry(slug);
  if (!entry) throw new Error(`Unknown animation "${slug}".`);

  onProgress?.('collecting-source');
  const prefix = `/src/animations/${slug}/`;
  const sourceEntries = await Promise.all(
    Object.entries(animationSourceLoaders)
      .filter(([path]) => path.startsWith(prefix))
      .map(async ([path, load]) => {
        const raw = await load();
        const relativePath = path.slice(prefix.length);
        return [relativePath, rewriteAnimationSource(raw, slug)] as const;
      }),
  );

  onProgress?.('collecting-assets');
  const assets = await fetchAnimationAssets(slug);

  onProgress?.('generating-project');
  const uiFiles = await collectStandaloneUiComponents();

  const zip = new JSZip();
  zip.file('package.json', packageJsonTemplate(entry.manifest));
  zip.file('vite.config.ts', VITE_CONFIG_TEMPLATE);
  zip.file('tsconfig.json', TSCONFIG_TEMPLATE);
  zip.file('index.html', indexHtmlTemplate(entry.manifest));
  zip.file('README.md', readmeTemplate(entry.manifest));

  zip.file('src/main.tsx', MAIN_TSX_TEMPLATE);
  zip.file('src/index.css', INDEX_CSS_TEMPLATE);
  zip.file('src/App.tsx', appTsxTemplate(entry.manifest, paramValues));

  // Lives at src/animations/support/ — a sibling of src/animations/<slug>/, matching
  // the depth of the real app's src/animations/_core/ so the copied animation source's
  // relative imports ('../support/...') resolve without rewriting their depth.
  zip.file('src/animations/support/manifest.ts', SUPPORT_MANIFEST_TS);
  zip.file('src/animations/support/params.ts', SUPPORT_PARAMS_TS);
  zip.file('src/animations/support/types.ts', SUPPORT_TYPES_TS);
  zip.file('src/animations/support/usePlayback.ts', SUPPORT_USE_PLAYBACK_TS);
  zip.file('src/animations/support/ControlsPortal.tsx', SUPPORT_CONTROLS_PORTAL_TSX);

  for (const [name, content] of Object.entries(uiFiles)) {
    zip.file(`src/ui/${name}`, content);
  }

  for (const [relativePath, content] of sourceEntries) {
    zip.file(`src/animations/${slug}/${relativePath}`, content);
  }

  for (const asset of assets) {
    const publicPath = asset.path.replace(`/animations/${slug}/`, '');
    zip.file(`public/${publicPath}`, asset.blob);
  }

  onProgress?.('zipping');
  const blob = await zip.generateAsync({ type: 'blob' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${slug}.zip`;
  link.click();
  URL.revokeObjectURL(url);

  onProgress?.('done');
}
