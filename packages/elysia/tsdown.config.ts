import { defineConfig } from 'tsdown'

import type { UserConfig } from 'tsdown'

const config: UserConfig = defineConfig({
  entry: ['./src/index.ts'],
  outDir: 'dist',
  external: ['elysia'],
  clean: true,
  publint: true
})

export default config
