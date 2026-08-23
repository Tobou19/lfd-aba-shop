module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  env: { node: true, jest: true },
  ignorePatterns: ['dist', 'node_modules', '**/*.spec.ts', 'test/**'],
  rules: {
    // Un service Prisma manipule beaucoup de types générés dynamiquement ;
    // interdire 'any' partout produirait plus de bruit que de valeur à ce
    // stade du projet. À resserrer une fois les DTO/types stabilisés.
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
