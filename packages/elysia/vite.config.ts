import { defineConfig } from 'vite-plus'

export default defineConfig({
  pack: {
    entry: ['./src/index.ts'],
    outDir: 'dist',
    clean: true,
    publint: true,
    deps: {
      neverBundle: ['elysia']
    }
  }
})
