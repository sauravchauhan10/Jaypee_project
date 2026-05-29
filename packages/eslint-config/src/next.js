// packages/eslint-config/src/next.js
import baseConfig from './base.js';

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
  ...baseConfig,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },
  {
    files: ['**/app/api/**/*.ts'],
    rules: { 'no-console': 'off' },
  },
];

export default config;
