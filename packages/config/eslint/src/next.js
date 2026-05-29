// packages/config/eslint/src/next.js
import { FlatCompat } from '@eslint/eslintrc';
import baseConfig from './base.js';

const compat = new FlatCompat();

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
  ...baseConfig,
  ...compat.extends('next/core-web-vitals'),
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // Next.js specific
      '@next/next/no-html-link-for-pages': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
  {
    // Allow console in API route handlers
    files: ['**/app/api/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
];

export default config;
