// @ts-check
import { defineConfig } from 'astro/config';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

/** Astro integration: inject <link rel="modulepreload"> for island dependencies */
function modulePreload() {
  return {
    name: 'module-preload',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const dist = fileURLToPath(dir);
        const astroDir = join(dist, '_astro');

        // Build import map: filename → [imported filenames]
        const jsFiles = (await readdir(astroDir)).filter(f => f.endsWith('.js'));
        const importMap = {};
        for (const file of jsFiles) {
          const code = await readFile(join(astroDir, file), 'utf8');
          importMap[file] = [...code.matchAll(/from"\.\/([^"]+)"/g)].map(m => m[1]);
        }

        // Get transitive deps
        function getDeps(file, visited = new Set()) {
          if (visited.has(file)) return visited;
          visited.add(file);
          for (const dep of importMap[file] || []) getDeps(dep, visited);
          return visited;
        }

        let pagesPatched = 0;

        // Recursively process HTML files
        async function processDir(dirPath) {
          for (const entry of await readdir(dirPath, { withFileTypes: true })) {
            const full = join(dirPath, entry.name);
            if (entry.isDirectory()) {
              await processDir(full);
            } else if (entry.name.endsWith('.html')) {
              let html = await readFile(full, 'utf8');

              // Collect entry points: component-url and renderer-url from <astro-island>
              const entries = new Set([
                ...html.matchAll(/component-url="\/_astro\/([^"]+)"/g),
                ...html.matchAll(/renderer-url="\/_astro\/([^"]+)"/g),
                ...html.matchAll(/src="\/_astro\/([^"]+\.js)"/g),
              ].map(m => m[1]));

              // Collect all transitive deps
              const allDeps = new Set();
              for (const entry of entries) {
                for (const dep of getDeps(entry)) allDeps.add(dep);
              }

              if (allDeps.size) {
                const links = [...allDeps]
                  .map(d => `<link rel="modulepreload" href="/_astro/${d}">`)
                  .join('');
                html = html.replace('</head>', links + '</head>');
                await writeFile(full, html);
                pagesPatched++;
              }
            }
          }
        }

        await processDir(dist);
        logger.info(`Injected modulepreload hints in ${pagesPatched} pages`);
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://gelchile.cl',
  compressHTML: true,
  build: {
    inlineStylesheets: 'always',
  },
  prefetch: {
    defaultStrategy: 'hover',
  },
  integrations: [
    preact(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
    modulePreload(),
  ],
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            const n = id.replace(/\\/g, '/');
            if (
              n.includes('node_modules/preact') ||
              n.includes('node_modules/@preact') ||
              n.includes('node_modules/nanostores') ||
              n.includes('node_modules/@nanostores')
            ) {
              return 'vendor';
            }
          },
        },
      },
    },
  },
});
