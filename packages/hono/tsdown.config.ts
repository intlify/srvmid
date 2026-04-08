import { defineConfig } from 'tsdown'

import type { UserConfig } from 'tsdown'

const config: UserConfig = defineConfig({
  entry: ['./src/index.ts'],
  outDir: 'dist',
  clean: true,
  publint: true,
  external: ['hono']
})

export default config
