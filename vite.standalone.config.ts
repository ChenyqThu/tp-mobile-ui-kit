import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  assetsInclude: ['**/*.pag'],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: false,
    assetsInlineLimit: 1024 * 1024,
    lib: {
      entry: path.resolve(import.meta.dirname, 'src/lib/standalone.ts'),
      formats: ['iife'],
      name: 'TPMobileUI',
      fileName: () => 'standalone.js',
    },
    rolldownOptions: {
      output: {
        codeSplitting: false,
      },
    },
  },
});
