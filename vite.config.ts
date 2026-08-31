import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      filename: 'service-worker.js',
      manifest: false,
      registerType: 'prompt',
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: [
          '**/*.{html,js,css,json,webmanifest,png,jpg,jpeg,svg,webp,ico,woff,woff2,ttf}',
        ],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: 'index.html',
      },
    }),
  ],
  server: { port: 5173 },
  build: { sourcemap: true }
})
