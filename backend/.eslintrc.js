module.exports = {
  env: {
    node: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended' // Intègre Prettier dans ESLint
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  overrides: [
    {
      files: ['*.js'],
      parserOptions: {
        sourceType: 'module'
      }
    }
  ],
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off'
  }
};
