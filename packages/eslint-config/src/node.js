// packages/eslint-config/src/node.js
import baseConfig from './base.js';

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
  ...baseConfig,
  {
    files: ['**/*.{ts,js}'],
    rules: { 'no-console': 'off' },
  },
];

export default config;
