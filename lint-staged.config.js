// lint-staged.config.js
/** @type {import('lint-staged').Config} */
const config = {
  '*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,css,yml,yaml}': ['prettier --write'],
};

export default config;
