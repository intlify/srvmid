import type { KnipConfig } from 'knip'

export default {
  ignore: ['**/src/**.test-d.ts'],
  ignoreDependencies: ['lint-staged', 'tsx', '@vitest/coverage-v8']
} satisfies KnipConfig
