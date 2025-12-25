module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: ['airbnb-base'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.json'],
        paths: ['.'],
      },
    },
  },
  rules: {
    'no-console': 'off',
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/tests/**', '**/*.test.js', 'scripts/**'] }],
    'import/extensions': 'off',
    'import/prefer-default-export': 'off',
    'no-underscore-dangle': 'off',
    'no-return-await': 'off',
    'no-await-in-loop': 'off',
    'no-restricted-syntax': 'off',
    'max-len': ['error', { code: 120 }],
    'consistent-return': 'off',
  },
};