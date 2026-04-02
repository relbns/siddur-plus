import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
const commitHash = execSync('git rev-parse --short HEAD').toString().trim();

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __COMMIT_HASH__: JSON.stringify(commitHash),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'favicon-96x96.png', 'data/**/*.json'],
      manifest: {
        name: 'סידור+',
        short_name: 'סידור+',
        description: 'אפליקציית סידור תפילה מלאה - תפילות, תהילים, הלכה ומצפן',
        theme_color: '#accce9',
        background_color: '#accce9',
        display: 'standalone',
        dir: 'rtl',
        lang: 'he',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        icons: [
          {
            src: 'web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}', 'data/**/*.json'],
        runtimeCaching: [
          {
            urlPattern: /\/data\/.*\.json$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'siddur-content',
              expiration: { maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: './',
});
