import tseslint from 'typescript-eslint';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  // ── Ignored paths ──────────────────────────────────────────────────────────
  {
    ignores: [
      '**/node_modules/**',
      'packages/site/dist/**',
      'packages/site/.astro/**',
      'packages/site/src/integrations/admin-dist/**',
      '.turbo/**',
    ],
  },

  // ── TypeScript rules — all source files ────────────────────────────────────
  // Uses typescript-eslint's recommended preset (no type-checked rules,
  // so no tsconfig project reference is needed at lint time).
  ...tseslint.configs.recommended,

  // Scoped overrides: globals + rule severity tweaks for our source packages.
  // The tsconfig already enforces noUnusedLocals / noUnusedParameters at build
  // time, so we set these to warn rather than error to avoid double-reporting.
  {
    files: ['packages/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // TypeScript handles type safety; any is sometimes necessary in util code
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow _prefixed names as intentional "unused" placeholders
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // ── React Hooks rules — admin-ui only ──────────────────────────────────────
  // Only the two stable rules; the newer v7 rules are experimental and noisy.
  {
    files: ['packages/admin-ui/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // ── Prettier — must be last ─────────────────────────────────────────────────
  // Disables all ESLint rules that would conflict with Prettier's formatting.
  prettierConfig,
);
