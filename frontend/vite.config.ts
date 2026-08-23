import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Le plugin PWA génère le manifest et le service worker qui rendent
// l'application installable depuis Chrome (Android) et Safari (iPhone)
// sans passer par un store applicatif — cf. cahier des charges §6.1.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'LFD-Services · ABA SHOP',
        short_name: 'ABA SHOP',
        description: 'Suivi des commandes, fidélité et reçus — LFD-Services',
        theme_color: '#1E5C48',
        background_color: '#F0F2E9',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Mise en cache réseau-prioritaire : les écrans déjà visités
        // restent utilisables lors d'une coupure de connexion courte,
        // cohérent avec l'usage en zones à connectivité variable (§6.5).
        runtimeCaching: [
          {
            urlPattern: /\/api\/v1\/.*/,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache', networkTimeoutSeconds: 4 },
          },
        ],
      },
    }),
  ],
  server: { port: 5173 },
});
