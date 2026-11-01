import { defineConfig } from 'vite-plus'

export default defineConfig({
  pack: {
    entry: ['./src/index.ts'],
    outDir: 'dist',
    clean: true,
    publint: true,
    dts: {
      // Emit the type declarations with Oxc (isolated declarations), not with the experimental tsgo of TypeScript 7
      generator: 'oxc'
    },
    deps: {
      neverBundle: ['hono']
    }
  }
})
