const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const eslintConfigPrettier = require('eslint-config-prettier');
const tsParser = require('@typescript-eslint/parser');
// When it works again do `npm install --save-dev eslint-plugin-import`
// const imprt = require('eslint-plugin-import');
// https://github.com/eslint/eslint/issues/18087
// https://github.com/import-js/eslint-plugin-import/pull/2829
const globals = require('globals');
const jest = require('eslint-plugin-jest');

const off = 'off';
const warn = 'warn';
const error = 'error';

// const TEST_ONLY_IMPORTS = ['fast-check', 'jest'];

/**
 * Set of typescript-eslint any rules
 *
 * @param {'error' | 'warn' | 'off'} level
 * @returns
 */
const any_rules = (level) => {
  return {
    '@typescript-eslint/no-unsafe-return': level,
    '@typescript-eslint/no-var-requires': level,
    '@typescript-eslint/no-unsafe-member-access': level,
    '@typescript-eslint/no-unsafe-assignment': level,
    '@typescript-eslint/no-unsafe-argument': level,
    '@typescript-eslint/no-unsafe-call': level,
    '@typescript-eslint/no-explicit-any': level,
  };
};

module.exports = [
  js.configs.recommended,
  tseslint.configs.eslintRecommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      globals: globals.node,
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        tsconfigRootDir: __dirname,
        project: [
          './tsconfig.eslint.json',
          './tsconfig.json',
          '/tsconfig.prod.json',
        ],
      },
    },
  },
  {
    ignores: [
      '**/node_modules',
      '**/dist',
      '**/build',
      '**/__snapshots__',
      '**/mocks',
      '**/coverage',
      '**/report',
    ],
  },
  // Disables all styling from eslint
  eslintConfigPrettier,
  {
    rules: {
      // ...imprt.configs['errors'].rules,
      // ...imprt.configs['warnings'].rules,
      // ...imprt.configs['typescript'].rules,
      // "import/no-extraneous-dependencies": error,
      'no-console': error,
      '@typescript-eslint/return-await': ['error', 'always'],
      'no-unused-vars': off,
      '@typescript-eslint/no-unused-vars': error,
      eqeqeq: [error, 'smart'],
      'no-else-return': [
        error,
        {
          allowElseIf: true,
        },
      ],
      '@typescript-eslint/require-await': error,
      '@typescript-eslint/unbound-method': [
        error,
        {
          ignoreStatic: true,
        },
      ],
      // See https://github.com/orgs/react-hook-form/discussions/8622#discussioncomment-4060570
      '@typescript-eslint/no-misused-promises': [
        error,
        {
          checksVoidReturn: {
            attributes: false,
          },
        },
      ],
      // 'no-restricted-imports': [
      //   'error',
      //   {
      //     paths: TEST_ONLY_IMPORTS.map((name) => {
      //       return { name,
      //         message: `${name} is only available during testing` };
      //     }),
      //     patterns: TEST_ONLY_IMPORTS.map(dep => `${dep}/*`),
      //   },
      // ],
      '@typescript-eslint/explicit-member-accessibility': warn,
      '@typescript-eslint/no-explicit-any': warn,
      '@typescript-eslint/explicit-function-return-type': off,
      // '@typescript-eslint/no-var-requires': off,
      '@typescript-eslint/no-empty-function': off,
      '@typescript-eslint/no-floating-promises': error,
    },
  },
  {
    files: ['.*.js', '.*.cjs', '*.config.cjs', '*.config.js', '*.config.ts'],
    rules: {
      'no-restricted-imports': off,
      // Consider if this is too leanient for tests
      ...any_rules('off'),
    },
  },
  {
    files: [
      '**/*.test.js',
      '**/*.spec.js',
      '**/*.test.ts',
      '**/*.spec.ts',
      'tests/**/*.js',
      'tests/**/*.ts',
      '__tests__/**/*.js',
      '__tests__/**/*.ts',
      'jest.*.js',
      'jest.*.ts',
    ],
    // https://eslint.org/docs/user-guide/configuring#specifying-environments
    languageOptions: { globals: globals.jest },
    plugins: { jest },
    rules: {
      ...jest.configs['recommended'].rules,
      // 'no-restricted-imports': off,
      'jest/expect-expect': [
        error,
        {
          assertFunctionNames: ['expect', 'fc.assert'],
        },
      ],
      ...any_rules('off'),
    },
  },
];
