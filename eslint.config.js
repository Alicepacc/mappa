// Flat ESLint config for the whole workspace (ESLint 10).
// Type-aware rules use typescript-eslint's project service so new files are
// picked up without listing every tsconfig here.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  {
    // Nothing generated, vendored or data-shaped should ever be linted.
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      'data/**',
      'pipeline/work/**',
      'pipeline/out/**',
      'packages/icons/dist/**',
      'packages/style/glyphs/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Unused *code* is a TS error (noUnusedLocals); here we only care about
      // intent-revealing underscore escapes.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      // Deliberate: the map/pipeline layer deals in loosely-typed GeoJSON and
      // upstream tag bags. Those crossings are narrowed explicitly at the edges.
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
    },
  },

  // Frontend
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    languageOptions: {
      globals: { ...globals.browser },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },

  // Backend + tooling run on Node
  {
    files: [
      'apps/gateway/**/*.ts',
      'packages/*/scripts/**/*.{ts,js}',
      'packages/*/src/**/*.ts',
      '*.{js,ts}',
    ],
    languageOptions: {
      globals: { ...globals.node },
    },
  },

  // Build tooling and scripts legitimately log to stdout.
  {
    files: ['**/*.config.{ts,js}', '**/scripts/**/*.{ts,js}', 'apps/gateway/src/**/*.ts'],
    rules: { 'no-console': 'off' },
  },

  // Tests
  {
    files: ['**/*.{test,spec}.{ts,tsx}', '**/tests/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },

  // Plain JS config files have no type information to lint against.
  {
    files: ['**/*.js'],
    ...tseslint.configs.disableTypeChecked,
  },

  prettier,
);
