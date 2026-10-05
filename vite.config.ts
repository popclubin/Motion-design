import { readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const VENDOR_PACKAGES = [
  'react',
  'react-dom',
  'react-router',
  'motion',
  'motion-dom',
  'motion-utils',
  'framer-motion',
  'lucide-react',
]

const vendorTest = new RegExp(`[\\\\/]node_modules[\\\\/](${VENDOR_PACKAGES.join('|')})[\\\\/]`)
const animationTest = /[\\/]src[\\/]animations[\\/]([^\\/]+)[\\/]/

/** Lists every file under public/animations/<slug>/ into a JSON manifest the exporter fetches at runtime. */
function animationAssetManifestPlugin(): Plugin {
  const publicDir = join(process.cwd(), 'public')
  const animationsDir = join(publicDir, 'animations')
  const manifestPath = join(publicDir, 'animation-assets-manifest.json')

  function walk(dir: string): string[] {
    let entries: string[] = []
    let items: string[]
    try {
      items = readdirSync(dir)
    } catch {
      return entries
    }
    for (const item of items) {
      const fullPath = join(dir, item)
      if (statSync(fullPath).isDirectory()) {
        entries = entries.concat(walk(fullPath))
      } else {
        entries.push(fullPath)
      }
    }
    return entries
  }

  function generate() {
    const files = walk(animationsDir).map((abs) => relative(publicDir, abs).split('\\').join('/'))
    const bySlug: Record<string, string[]> = {}
    for (const file of files) {
      const slug = file.split('/')[1]
      if (!slug) continue
      bySlug[slug] ??= []
      bySlug[slug].push(`/${file}`)
    }
    writeFileSync(manifestPath, JSON.stringify(bySlug, null, 2))
  }

  return {
    name: 'animation-asset-manifest',
    buildStart: generate,
    configureServer(server) {
      generate()
      server.watcher.add(animationsDir)
      server.watcher.on('all', (_event, path) => {
        if (path.includes(`${join('public', 'animations')}`)) generate()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), animationAssetManifestPlugin()],
  build: {
    rollupOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'vendor', test: vendorTest, priority: 2 },
            // Raw-text source used only by the exporter (import.meta.glob ?raw) must
            // never merge into the per-animation chunk the editor loads to render it.
            { name: 'export-source', test: /[?&]raw/, priority: 3 },
            {
              debugName: 'per-animation-chunks',
              name: (id) => {
                const match = id.match(animationTest)
                return match && !match[1]!.startsWith('_') ? `anim-${match[1]}` : null
              },
              priority: 1,
            },
          ],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
})
