const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettier = require('eslint-plugin-prettier');
const react = require('eslint-plugin-react');
const importPlugin = require('eslint-plugin-import');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    plugins: {
      prettier,
      react,
      import: importPlugin,
    },
    extends: ['plugin:import/recommended', 'plugin:prettier/recommended'],
    rules: {
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function',
        },
      ],
      'prettier/prettier': 'error',
      'import/order': [
        'error',
        {
          groups: [
            ['builtin', 'external', 'internal'],
            'index',
            ['parent', 'sibling'],
            'object',
          ],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
    overrides: [
      {
        files: ['app/_layout.tsx'],
        rules: {
          'import/order': 'off',
        },
      },
    ],
  },
]);
