import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@admin': fileURLToPath(new URL('./packages/admin-ui/src', import.meta.url)),
      '@site': fileURLToPath(new URL('./packages/site/src', import.meta.url)),
    },
  },
  test: {
    include: ['packages/*/tests/**/*.test.ts', 'packages/*/tests/**/*.test.tsx'],
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
  },
});
