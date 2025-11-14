import { defaultExclude, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 60_000,
    include: ['**/*.test.?(c|m)[jt]s?(x)'],
    exclude: [...defaultExclude]
  }
})
