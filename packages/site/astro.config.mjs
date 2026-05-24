// @ts-check
import { defineConfig } from 'astro/config';
import { contentAdmin } from './src/integrations/content-admin.ts';

// https://astro.build/config
export default defineConfig({
	integrations: [contentAdmin()],
});
