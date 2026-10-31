import type { KnipConfig } from 'knip'

export default {
  // Vite+ runs Vitest and Vite, but knip enables these plugins only when `vitest` / `vite` are dependencies
  vite: true,
  vitest: true,
  workspaces: {
    '.': {
      entry: ['scripts/private.ts', 'vitest.e2e.config.ts']
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
    },
    'packages/nitro': {
      ignore: ['**/playground/**']
    }
  },
  // `publint` is an optional peer dependency of Vite+ that `pack.publint` loads
  ignoreDependencies: ['publint', 'h3'],
  // `vite` / `vitest` catalog entries are referenced by `overrides` in pnpm-workspace.yaml
  exclude: ['catalog']
} satisfies KnipConfig
