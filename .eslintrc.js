// @ts-check
/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    // NestJS uses emitDecoratorMetadata — `import type` strips runtime type
    // info needed for dependency injection. Disable this rule project-wide.
    '@typescript-eslint/consistent-type-imports': 'off',

    // Commonly noisy rules in NestJS codebases
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
  env: {
    node: true,
    es2022: true,
  },
};
