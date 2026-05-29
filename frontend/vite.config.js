import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    // Target modern browsers
    target: 'es2020',

    // Warn on chunks > 600 kB (relaxed from default 500)
    chunkSizeWarningLimit: 600,

    // Code splitting — isolate large vendor libs into separate chunks
    rollupOptions: {
      output: {
        // Vite 8 (rolldown) requires manualChunks as a function
        manualChunks: (id) => {
          if (id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/chart.js') ||
              id.includes('node_modules/react-chartjs-2')) {
            return 'vendor-charts';
          }
          if (id.includes('node_modules/axios')) {
            return 'vendor-axios';
          }
        },
      },
    },

    // Source maps only in development
    sourcemap: false,

    // Vite 8 uses oxc as default minifier (esbuild deprecated)
    // minify: 'oxc',   // 'oxc' | 'terser' — default is already oxc
  },

  // Expose env vars with VITE_ prefix
  envPrefix: 'VITE_',
});
