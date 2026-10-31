import { defaultExclude, defineConfig } from 'vite-plus'

export default defineConfig({
  test: {
    testTimeout: 60_000,
    include: ['**/*.spec.?(c|m)[jt]s?(x)'],
    exclude: [...defaultExclude],
    // Run e2e tests serially (not in parallel)
    fileParallelism: false
  }
})
