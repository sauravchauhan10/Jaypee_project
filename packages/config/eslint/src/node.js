// packages/config/eslint/src/node.js
import baseConfig from './base.js';

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
  ...baseConfig,
  {
    files: ['**/*.{ts,js}'],
    rules: {
      // Node.js / server-specific overrides
      'no-console': 'off',
      '@typescript-eslint/no-require-imports': 'error',
    },
  },
];

export default config;
