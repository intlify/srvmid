import { Elysia } from 'elysia'
import { serve } from 'srvx'
import { getHeaderLocale } from '../../src/index.ts' // `@intlify/elysia`

const app = new Elysia().get('/', ctx => {
  const locale = getHeaderLocale(ctx.request)
  return locale.toString()
})

const server = serve({
  port: 3000,
  fetch: app.fetch
})

await server.ready()
