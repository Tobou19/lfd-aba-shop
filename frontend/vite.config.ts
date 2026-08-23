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
      includeAssets: [
        'favicon.svg', 
        'icons/icon-192.svg', 
        'icons/icon-512.svg',
        'images/lfd-logo.png',
        'images/qr-code-shop.png',
        'images/center-photo.jpg',
      ],
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
          { src: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
          { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
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
            options: { 
              cacheName: 'api-cache',
              networkTimeoutSeconds: 4,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 5 * 60, // 5 minutes
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
              },
            },
          },
          {
            urlPattern: /\.(?:eot|ttf|woff|woff2)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'font-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 365 * 24 * 60 * 60, // 1 an
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 jours
              },
            },
          },
          {
            urlPattern: /\.(?:js|css)$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60, // 1 jour
              },
            },
          },
        ],
        // Configuration pour le mode hors connexion
        clientsClaim: true,
        skipWaiting: true,
        navigateFallbackDenylist: [/\/api\/v1\/.*/],
        navigateFallback: '/index.html',
        // Précache des ressources essentielles
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
      },
    }),
  ],
  server: { 
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending request to the target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received response from the target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
});
