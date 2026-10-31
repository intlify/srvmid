import { defineConfig } from 'vite-plus'
import {
  defineFmtConfig,
  defineLintConfig,
  defaultIgnoreFilesOfEnforceHeaderCommentRule
} from '@kazupon/vp-config'

const ignorePatterns = ['**/dist/**', 'CHANGELOG.md', 'packages/**/docs/**', '**/playground/**']

export default defineConfig({
  staged: {
    '*': 'vp check --fix'
  },
  fmt: defineFmtConfig({
    // keep the current Markdown wrapping (Prettier's default). `never` reflows 26 Markdown files
    proseWrap: 'preserve',
    ignorePatterns: [
      'packages/h3/docs/**',
      'packages/hono/docs/**',
      '**/package.json',
      'pnpm-lock.yaml',
      'pnpm-workspace.yaml'
    ]
  }),
  lint: defineLintConfig({
    ignorePatterns,
    typescript: {
      rules: {
        // `import('…')` type annotations are used in spec files
        'typescript/consistent-type-imports': [
          'error',
          {
            prefer: 'type-imports',
            fixStyle: 'separate-type-imports',
            disallowTypeAnnotations: false
          }
        ]
      }
    },
    jsdoc: {
      typescript: 'syntax'
    },
    rules: {
      // parity with typescript-eslint `recommendedTypeChecked` that ESLint ran before.
      // oxlint enables these as warnings by default
      'typescript/await-thenable': 'error',
      'typescript/no-array-delete': 'error',
      'typescript/no-base-to-string': 'error',
      'typescript/no-duplicate-type-constituents': 'error',
      'typescript/no-floating-promises': 'error',
      'typescript/no-for-in-array': 'error',
      'typescript/no-implied-eval': 'error',
      'typescript/no-redundant-type-constituents': 'error',
      'typescript/no-unsafe-unary-minus': 'error',
      'typescript/restrict-template-expressions': 'error',
      'typescript/unbound-method': 'error',
      // oxlint does not enable these by default
      'typescript/no-misused-promises': 'error',
      'typescript/no-unnecessary-type-assertion': 'error',
      'typescript/no-unsafe-argument': 'error',
      'typescript/no-unsafe-assignment': 'error',
      'typescript/no-unsafe-call': 'error',
      'typescript/no-unsafe-enum-comparison': 'error',
      'typescript/no-unsafe-member-access': 'error',
      'typescript/no-unsafe-return': 'error',
      'typescript/only-throw-error': 'error',
      'typescript/prefer-promise-reject-errors': 'error',
      'typescript/require-await': 'error',
      'typescript/restrict-plus-operands': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'vite-plus/prefer-vite-plus-imports': 'error'
    },
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    overrides: [
      {
        // the ESLint jsdoc preset ignored these before
        files: ['**/spec/**', 'packages/shared/**'],
        rules: { 'ox-jsdoc/require-jsdoc': 'off', 'ox-jsdoc/require-description': 'off' }
      }
    ],
    comments: {
      enForceHeaderComment: {
        ignoreFiles: [
          ...defaultIgnoreFilesOfEnforceHeaderCommentRule,
          '**/*.e2e-{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
          'scripts/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
        ]
      }
    }
  }),
  test: {
    testTimeout: 60_000,
    include: ['**/*.test.?(c|m)[jt]s?(x)']
  }
})
