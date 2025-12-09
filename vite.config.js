import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/valle/',
  plugins: [
    react(),
    VitePWA({
      // ✅ CAMBIO IMPORTANTE: Usar injectManifest para control manual
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'manifest.json'],
      
      // Configuración del manifest
      manifest: {
        name: 'Sistema Presentismo PWA',
        short_name: 'Presentismo',
        description: 'Sistema PWA de Presentismo con IA para Cabañas en Tandil.',
        start_url: '/valle/',
        display: 'standalone',
        background_color: '#FFFBEB',
        theme_color: '#059669',
        scope: '/valle/',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/valle/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/valle/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/valle/icons/icon-512x512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },

      // Configuración para injectManifest
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 3000000 // 3MB
      },

      // Desarrollo
      devOptions: {
        enabled: false,
        type: 'module'
      }
    })
  ],
})