import type { KnipConfig } from 'knip'

export default {
  workspaces: {
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
  ignore: ['**/src/**.test-d.ts'],
  ignoreDependencies: ['lint-staged', '@vitest/coverage-v8']
} satisfies KnipConfig
