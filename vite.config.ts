import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // PWA Plugin - Enable offline capabilities and installability
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Cal AI - Smart Nutrition Tracker',
        short_name: 'Cal AI',
        description: 'AI-powered calorie and nutrition tracking. Snap, Scan, Know.',
        theme_color: '#10B981',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        categories: ['health', 'lifestyle', 'productivity']
      },
      workbox: {
        // Cache configuration for runtime caching
        runtimeCaching: [
          {
            // Cache Supabase API requests with network-first strategy
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache image uploads with cache-first strategy
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*\.(png|jpg|jpeg|webp|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache Google Fonts with stale-while-revalidate
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            // Cache static assets with cache-first strategy
            urlPattern: /\.(?:js|css|woff2?|ttf|otf|eot)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 90 // 90 days
              }
            }
          }
        ],
        // Clean up outdated caches
        cleanupOutdatedCaches: true,
        // Skip waiting and activate immediately
        skipWaiting: true,
        clientsClaim: true,
        // Max 50MB cache size
        maximumFileSizeToCacheInBytes: 50 * 1024 * 1024
      },
      devOptions: {
        enabled: false, // Disable PWA in dev mode for faster dev experience
        type: 'module'
      }
    }),
    // Upload source maps to Sentry in production builds
    mode === "production" &&
      process.env.SENTRY_AUTH_TOKEN &&
      sentryVitePlugin({
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        telemetry: false,
        sourcemaps: {
          assets: "./dist/assets/**",
          filesToDeleteAfterUpload: ["./dist/assets/**/*.map"],
        },
      }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Enable minification using esbuild (fast and efficient)
    minify: 'esbuild',

    // Target modern browsers for smaller bundle sizes
    target: 'esnext',

    // Optimize chunks
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Core vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'supabase-vendor': ['@supabase/supabase-js'],

          // Split Radix UI into logical groups
          'radix-dialogs': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-alert-dialog',
          ],
          'radix-forms': [
            '@radix-ui/react-select',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-label',
          ],
          'radix-popovers': [
            '@radix-ui/react-popover',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-dropdown-menu',
          ],
          'radix-ui': [
            '@radix-ui/react-tabs',
            '@radix-ui/react-progress',
            '@radix-ui/react-separator',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-slot',
          ],

          // Separate heavy charting library
          'charts': ['recharts'],

          // Date utilities
          'date-utils': ['date-fns'],

          // Other utilities
          'utils': ['lucide-react', 'sonner', 'zod'],
        },
        // Optimize chunk file names for caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },

    // Chunk size warnings - warn if any chunk exceeds 200KB
    chunkSizeWarningLimit: 200,

    // Enable source maps for Sentry error tracking
    // Source maps are uploaded to Sentry and then deleted from build
    sourcemap: true,

    // Optimize CSS
    cssMinify: true,

    // Report compressed size (slower but useful for monitoring)
    reportCompressedSize: true,
  },

  // Performance optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
    ],
  },
}));
