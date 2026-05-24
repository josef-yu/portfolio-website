import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Assets must be prefixed with /_admin/ so the Vite middleware routes them correctly
  base: '/_admin/',
  build: {
    outDir: '../site/src/integrations/admin-dist',
    emptyOutDir: true,
  },
});
