// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import { contentAdmin } from './src/integrations/content-admin.ts';

// https://astro.build/config
export default defineConfig({
  integrations: [contentAdmin()],
  vite: {
    resolve: {
      alias: {
        '@site': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
});
