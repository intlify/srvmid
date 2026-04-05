import type { KnipConfig } from 'knip'

export default {
  workspaces: {
    '.': {
      entry: ['scripts/private.ts']
    },
    'packages/h3': {
      ignore: ['**/playground/**'],
      ignoreDependencies: ['srvx']
    },
    'packages/hono': {
      ignore: ['**/playground/**']
    },
    'packages/elysia': {
      ignore: ['**/playground/**']
    }
  },
  ignoreDependencies: ['lint-staged', '@vitest/coverage-v8', '@kazupon/eslint-plugin']
} satisfies KnipConfig
