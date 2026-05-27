import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@admin': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Assets must be prefixed with /_admin/ so the Vite middleware routes them correctly
  base: '/_admin/',
  build: {
    outDir: '../site/src/integrations/admin-dist',
    emptyOutDir: true,
    // TipTap + ProseMirror legitimately exceed 500 kB; silence the noise.
    chunkSizeWarningLimit: 800,
  },
});
