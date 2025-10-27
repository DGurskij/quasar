import globals from 'globals';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginImport from 'eslint-plugin-import';
import stylisticPlugin from '@stylistic/eslint-plugin';

export default [
  {
    files: ['src/**/*.ts', 'test/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: 'tsconfig.json',
        sourceType: 'module',
      },
      parser: tseslint.parser,
      globals: globals.node,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: eslintPluginImport,
      '@stylistic': stylisticPlugin,
    },
    rules: {
      '@stylistic/quotes': ['warn', 'single', { avoidEscape: true }],
      'prefer-const': [
        'error',
        {
          destructuring: 'any',
          ignoreReadBeforeAssign: false,
        },
      ],
      'prefer-destructuring': [
        'warn',
        {
          array: false,
          object: true,
        },
      ],
      'import/order': [
        'error',
        {
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          caughtErrors: 'none',
        },
      ],
      // "sort-imports": ["error", {
      //   "ignoreCase": false,
      //   "ignoreDeclarationSort": false,
      //   "ignoreMemberSort": false,
      //   "memberSyntaxSortOrder": ["none", "all", "multiple", "single"],
      //   "allowSeparatedGroups": false
      // }],
    },
  },
  {
    ...eslintPluginPrettierRecommended,
    files: ['src/**/*.ts', 'test/**/*.ts'],
  },
];
