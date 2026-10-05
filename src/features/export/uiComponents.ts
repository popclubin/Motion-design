// Lazily fetched only when exporting — see exportAnimation.ts for why `?raw`.
const uiSourceLoaders = import.meta.glob('/src/components/ui/*.tsx', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>;

const NEEDED_UI_COMPONENTS = [
  'Slider',
  'NumberInput',
  'ColorInput',
  'Toggle',
  'Select',
  'Segmented',
  'Button',
  'Section',
] as const;

export const CX_TS_TEMPLATE = `import { type ClassValue, clsx } from 'clsx';

export function cx(...inputs: ClassValue[]): string {
  return clsx(...inputs);
}
`;

/** Returns { "Slider.tsx": "<rewritten source>", ... } plus a cx.ts shim. */
export async function collectStandaloneUiComponents(): Promise<Record<string, string>> {
  const files: Record<string, string> = { 'cx.ts': CX_TS_TEMPLATE };

  for (const name of NEEDED_UI_COMPONENTS) {
    const path = `/src/components/ui/${name}.tsx`;
    const loader = uiSourceLoaders[path];
    if (!loader) continue;
    const raw = await loader();
    files[`${name}.tsx`] = raw.replaceAll("'../../lib/utils'", "'./cx'");
  }

  return files;
}
