// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://gelchile.cl',
  compressHTML: true,
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
  ],
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'preact-vendor': ['preact', 'preact/hooks', 'nanostores', '@nanostores/preact'],
          },
        },
      },
    },
  },
});
