import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const basePath = env.VITE_BASE_PATH || '/'
  const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`

  return {
    base: normalizedBase,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'icons/*.png'],
        manifest: {
          name: 'Slovakia Travel Companion',
          short_name: 'Trip Companion',
          description: 'Family travel companion for Slovakia & Poland 2026',
          theme_color: '#0f766e',
          background_color: '#0c1222',
          display: 'standalone',
          start_url: `${normalizedBase}#/today`,
          scope: normalizedBase,
          icons: [
            {
              src: 'favicon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2,pdf}'],
          // Opening a PDF in a new tab is a navigation request. Keep document
          // URLs out of the SPA fallback so they are served as actual files.
          navigateFallbackDenylist: [/\/docs\//],
          // The illustration set alone is ~1.3 MB; keep room for it in precache.
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, 'src'),
      },
    },
    define: {
      __APP_BASE_PATH__: JSON.stringify(normalizedBase),
    },
    server: {
      port: 5173,
      strictPort: true,
    },
    preview: {
      port: 4173,
      strictPort: true,
    },
  }
})
