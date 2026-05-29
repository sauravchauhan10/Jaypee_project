import baseConfig from '@prescribeflow/eslint-config/next';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  ...baseConfig,
  {
    ignores: ['.next/**', 'dist/**', 'node_modules/**'],
  },
];
