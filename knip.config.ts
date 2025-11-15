import type { KnipConfig } from 'knip'

export default {
  workspaces: {
    'packages/h3': {
      ignore: ['**/playground/**'],
      ignoreDependencies: ['srvx']
    },
    'packages/hono': {
      ignore: ['**/playground/**']
    }
  },
  ignore: ['**/src/**.test-d.ts'],
  ignoreDependencies: [
    'lint-staged',
    '@vitest/coverage-v8',
    'vitest-environment-miniflare',
    'miniflare'
  ]
} satisfies KnipConfig
