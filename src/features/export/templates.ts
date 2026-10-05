import type { AnimationManifest } from '../../animations/_core/manifest';

export function packageJsonTemplate(manifest: AnimationManifest): string {
  const dependencies: Record<string, string> = {
    react: '^19.0.0',
    'react-dom': '^19.0.0',
    'lucide-react': '^0.460.0',
    clsx: '^2.1.1',
    ...manifest.dependencies,
  };

  return JSON.stringify(
    {
      name: manifest.slug,
      private: true,
      version: '1.0.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview',
      },
      dependencies,
      devDependencies: {
        '@tailwindcss/vite': '^4.0.0',
        '@types/react': '^19.0.0',
        '@types/react-dom': '^19.0.0',
        '@vitejs/plugin-react': '^4.3.0',
        tailwindcss: '^4.0.0',
        typescript: '^5.6.0',
        vite: '^6.0.0',
      },
    },
    null,
    2,
  );
}

export const VITE_CONFIG_TEMPLATE = `import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
`;

export const TSCONFIG_TEMPLATE = JSON.stringify(
  {
    compilerOptions: {
      target: 'ES2022',
      lib: ['ES2022', 'DOM'],
      module: 'ESNext',
      moduleResolution: 'bundler',
      jsx: 'react-jsx',
      strict: false,
      skipLibCheck: true,
      noEmit: true,
      isolatedModules: true,
      resolveJsonModule: true,
      esModuleInterop: true,
    },
    include: ['src'],
  },
  null,
  2,
);

export function indexHtmlTemplate(manifest: AnimationManifest): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${manifest.name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}

export const MAIN_TSX_TEMPLATE = `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`;

export const INDEX_CSS_TEMPLATE = `@import 'tailwindcss';

:root {
  --color-bg: #0e0e11;
  --color-panel: #141418;
  --color-raised: #1b1b20;
  --color-border: #26262c;
  --color-text: #f2f2f4;
  --color-muted: #8c8c96;
  --color-accent: #3d7bfa;
  --color-accent-hover: #5a8ffb;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
}

@theme {
  --color-bg: var(--color-bg);
  --color-panel: var(--color-panel);
  --color-raised: var(--color-raised);
  --color-border: var(--color-border);
  --color-text: var(--color-text);
  --color-muted: var(--color-muted);
  --color-accent: var(--color-accent);
  --color-accent-hover: var(--color-accent-hover);
  --radius-sm: var(--radius-sm);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
}

body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 13.5px;
}
`;

export function readmeTemplate(manifest: AnimationManifest): string {
  return `# ${manifest.name}

Exported from Motion Library.

${manifest.description}

## Run

\`\`\`bash
npm install
npm run dev
\`\`\`

Then open the printed localhost URL. Tune the animation with the panel on the right — it starts from the values you had set in Motion Library when you exported it.
`;
}
