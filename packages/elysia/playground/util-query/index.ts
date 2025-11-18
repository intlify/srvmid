import { Elysia } from 'elysia'
import { serve } from 'srvx'
import { getQueryLocale } from '../../src/index.ts' // `@intlify/elysia`

const app = new Elysia().get('/', ctx => {
  const locale = getQueryLocale(ctx.request)
  return locale.toString()
})

const server = serve({
  port: 3000,
  fetch: app.fetch
})

await server.ready()
